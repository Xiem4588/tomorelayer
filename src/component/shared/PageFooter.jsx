import React from 'react'
import {
  Box,
  Container,
  Grid,
  Link,
} from '@material-ui/core'
import { AdapterLink } from 'component/shared/Adapters'

const FooterLinks = [
  {
    text: 'Need helps?',
    link: '/help',
  },
  {
    text: 'Privacy Policy',
    link: '/policy',
  },
  {
    text: 'Term of services',
    link: '/terms-and-services',
  },
  {
    text: 'API Documents',
    link: '/documents',
  },
]

const FooterButtons = [
  {
    className: 'tomorelayer-icon-facebook',
    link: 'https://www.facebook.com/tomochainofficial',
  },
  {
    className: 'tomorelayer-icon-twitter',
    link: 'https://twitter.com/TomoChainANN',
  },
  {
    className: 'tomorelayer-icon-telegram',
    link: 'https://t.me/tomochain',
  },
  {
    className: 'tomorelayer-icon-github',
    link: 'https://github.com/tomochain/',
  },
  {
    className: 'tomorelayer-icon-linkedin',
    link: 'https://www.linkedin.com/company/tomochain',
  },
  {
    className: 'tomorelayer-icon-reddit',
    link: 'https://www.reddit.com/r/Tomochain/',
  },
]

const PageFooter = () => (
  <Container>
    <Grid container>
      <Grid item sm={12} md={6}>
        <Box>
          Tomorelayer 2019 - v1.0.0 - designed by TomoDesign
        </Box>
        <Box className="footer-links">
          {FooterLinks.map(item => (
            <Link to={item.link} key={item.link} component={AdapterLink}>
              {item.text}
            </Link>
          ))}
        </Box>
      </Grid>
      <Grid item sm={12} md={6}>
        <ul className="footer-buttons">
          {FooterButtons.map(item => (
            <li key={item.link}>
              <Link href={item.link} underline="none" rel="noopener noreferrer" target="_blank">
                <i className={item.className} />
              </Link>
            </li>
          ))}
        </ul>
      </Grid>
    </Grid>
  </Container>
)

export default PageFooter
