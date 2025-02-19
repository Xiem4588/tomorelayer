import json
from os import getenv
from util.jwt_encoder import encode_payload
from util.decorator import deprecated
from exception import InvalidValueException, MissingArgumentException
from .base import BaseHandler
from .socket import SocketClient


class AuthHandler(BaseHandler):

    def get(self):
        user_address = self.get_argument('address', None)

        if not user_address:
            raise MissingArgumentException('Missing user address')

        try:
            checksum_addr = self.application.blockchain.web3.toChecksumAddress(user_address.lower())
            self.application.blockchain.web3.eth.getBalance(checksum_addr)
            token, expiry = encode_payload({'address': user_address})
            return self.json_response({'token': token, 'exp': expiry })
        except Exception as err:
            raise InvalidValueException('address is not valid')

    @deprecated
    def post(self):
        """Receiving request from TomoWallet"""
        conn_id = self.get_argument('verifyId', '')
        signer_address = self.request_body['signer'].lower()
        signature = self.request_body['signature'].lower()
        conn = SocketClient.retrieve(conn_id)
        payload = json.dumps({
            'type': 'QR_CODE_LOGIN',
            'meta': {
                'conn_id': conn_id,
                'address': signer_address,
                'signature': signature,
            }
        })
        conn.write_message(payload)


class AuthSocketHandler():

    @staticmethod
    def get_qr_code(identity):
        from datetime import datetime
        message = '[Relayer {}] Login'.format(datetime.now().strftime('%x %H-%M-%S'))
        tunnel = getenv('TUNNEL_URL', '')
        url = '{tunnel}/api/auth?verifyId={identity}'.format(tunnel=tunnel, identity=identity)

        return json.dumps({
            'type': 'QR_CODE_REQUEST',
            'meta': {
                'message': message,
                'id': identity,
                'url': url,
            }
        })
