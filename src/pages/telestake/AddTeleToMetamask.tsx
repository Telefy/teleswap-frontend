/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Token } from '@telefy/teleswap-core-sdk'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'

interface AddTeleToMetamaskProps {
  token: Token
}

const AddTeleToMetamask: React.FC<AddTeleToMetamaskProps> = ({ token }) => {
  const { addToken, success } = useAddTokenToMetamask(token)

  return (
    <div className="box-link">
      <a onClick={addToken} rel="noreferrer">
        Add to Metamask
      </a>
    </div>
  )
}

export default AddTeleToMetamask
