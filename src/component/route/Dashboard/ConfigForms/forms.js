import * as validUrl from 'valid-url'
import { withFormik } from 'formik'
import { SITE_MAP } from 'service/constant'
import { AlertVariant } from 'service/frontend'
import * as http from 'service/backend'
import * as blk from 'service/blockchain'
import { validateCoinbase } from 'service/blockchain'

export const wrappers = {
  infoForm: withFormik({
    displayName: 'RelayerInfoForm',
    enableReinitialize: true,
    validateOnChange: false,
    mapPropsToValues: (props) => ({
      owner: props.relayer.owner,
      name: props.relayer.name,
      link: props.relayer.link,
      logo: props.relayer.logo,
    }),

    validate: (values) => {
      const errors = {}
      const check = (key, func, message) => {
        if (!func(values[key])) {
          errors[key] = message
        }
      }
      check('name', (name) => name && name.length < 200 && name.length >= 3, 'invalid name length')
      check('link', (url) => !url || validUrl.isUri(url), 'invalid link url')
      check('logo', (url) => !url || validUrl.isUri(url), 'invalid logo url')
      return errors
    },

    handleSubmit: async (values, meta) => {
      const relayer = await http.updateRelayer({ ...values, id: meta.props.relayer.id })

      if (relayer.error) {
        meta.props.PushAlert({ variant: AlertVariant.error, message: relayer.error })
      } else {
        meta.props.PushAlert({ variant: AlertVariant.success, message: 'relayer info updated' })
        meta.props.UpdateRelayer(relayer)
      }

      meta.setSubmitting(false)
    },
  }),

  tradeForm: withFormik({
    displayName: 'RelayerTradeOptionForm',
    enableReinitialize: true,
    validateOnChange: false,
    mapPropsToValues: (props) => ({
      owner: props.relayer.owner,
      trade_fee: props.relayer.trade_fee / 100,
      from_tokens: props.relayer.from_tokens,
      to_tokens: props.relayer.to_tokens,
    }),

    handleSubmit: async (values, meta) => {
      const payload = {
        ...meta.props.relayer,
        ...values,
        trade_fee: values.trade_fee * 100,
      }

      const { status, details } = await meta.props.RelayerContract.update(payload)

      if (!status) {
        meta.props.PushAlert({ variant: AlertVariant.error, message: details })
      } else {
        const relayer = await http.updateRelayer(payload)
        meta.props.PushAlert({ variant: AlertVariant.success, message: 'relayer trade options updated' })
        meta.props.UpdateRelayer(relayer)
      }

      meta.setSubmitting(false)
    },
  }),

  depositForm: withFormik({
    displayName: 'RelayerDepositForm',
    validateOnChange: false,
    mapPropsToValues: () => ({
      deposit: 0,
    }),

    validate: (values) => {
      const errors = {}
      if (values.deposit <= 0) {
        errors.deposit = 'New deposit must be larger than 0'
      }
      return errors
    },

    handleSubmit: async (values, meta) => {
      const config = { value: blk.toWei(values.deposit) }
      const payload = { coinbase: meta.props.relayer.coinbase }
      const { status, details } = await meta.props.RelayerContract.depositMore(payload, config)

      if (!status) {
        meta.props.PushAlert({ variant: AlertVariant.error, message: details })
      } else {
        const relayer = await http.updateRelayer({
          owner: meta.props.relayer.owner,
          deposit: meta.props.relayer.deposit + values.deposit,
          id: meta.props.relayer.id,
        })
        meta.props.PushAlert({ variant: AlertVariant.success, message: 'new deposit has been made' })
        meta.props.UpdateRelayer(relayer)
      }

      meta.setSubmitting(false)
    },
  }),

  transferForm: withFormik({
    displayName: 'RelayerTransferForm',
    enableReinitialize: true,
    validateOnChange: false,
    mapPropsToValues: (props) => ({
      owner: props.relayer.owner,
      coinbase: props.relayer.coinbase,
    }),

    validate: (values, props) => {
      const errors = {}

      validateCoinbase(values.coinbase, (isValid) => {
        if (!isValid) {
          errors.coinbase = 'invalid addresss'
        }
      })

      validateCoinbase(values.owner, (isValid) => {
        if (!isValid) {
          errors.owner = 'invalid addresss'
        }
      })

      if (values.coinbase !== props.relayer.coinbase && props.invalidCoinbases.includes(values.coinbase)) {
        errors.coinbase = 'invalid coinbase'
      }

      if (props.invalidOwnerAddresses.includes(values.owner)) {
        errors.owner = 'invalid owner address'
      }

      if (values.coinbase === values.owner) {
        errors.coinbase = errors.owner = 'coinbase cannot be the same as owner address'
      }

      return errors
    },

    handleSubmit: async (values, meta) => {
      const { status, details } = await meta.props.RelayerContract.transfer({
        ...values,
        currentCoinbase: meta.props.relayer.coinbase,
      })

      if (!status) {
        meta.props.PushAlert({ variant: AlertVariant.error, message: details })
      } else {
        const relayer = await http.updateRelayer({
          new_owner: values.owner,
          owner: meta.props.relayer.owner,
          coinbase: values.coinbase,
          id: meta.props.relayer.id,
        })
        meta.props.PushAlert({ variant: AlertVariant.success, message: 'relayer transfered successfuly' })
        meta.props.UpdateRelayer(relayer)
      }

      meta.setSubmitting(false)
      setTimeout(() => meta.props.history.push(SITE_MAP.Dashboard), 200)
    },
  }),
}
