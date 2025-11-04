import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Zoom from '@mui/material/Zoom'
import Alert from '@mui/material/Alert'
import { useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import dokyanhIcon from '../assets/xiaomi-logo.png'
import { API_ROOT } from '~/utils/constants'
import authorizeAxiosInstance from '~/utils/authorizedAxios'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '~/redux/user/userSlice'

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const submitLogIn = async (data) => {
    const res = await authorizeAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
    const userInfo = {
      id: res.data.id,
      email: res.data.email
    }
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))

    // Dispatch user data vào Redux store
    dispatch(setUser({
      id: res.data.id,
      name: res.data.name || res.data.email, // Nếu không có name thì dùng email
      email: res.data.email,
      accessToken: res.data.accessToken
    }))

    // Điều hướng khi login thành công
    navigate('/dashboard')
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'flex-start',
      background: 'url("src/assets/trungquandev-bg-img.jpeg")',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.4)'
    }}>
      <form onSubmit={handleSubmit(submitLogIn)}>
        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
          <MuiCard sx={{ minWidth: 380, maxWidth: 380, marginTop: '6em', p: '0.5em 0', borderRadius: 2 }}>
            <Box sx={{ width: '70px', bgcolor: 'white', margin: '0 auto' }}>
              <img src={dokyanhIcon} alt='dokyanh' width='100%' />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', color: theme => theme.palette.grey[500] }}>
              <Box>
                <Typography>Hint: dokyanh.official@gmail.com</Typography>
                <Typography>Pass: dokyanh@123</Typography>
              </Box>
            </Box>
            <Box sx={{ padding: '0 1em 1em 1em' }}>
              <Box sx={{ marginTop: '1.2em' }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Enter Email..."
                  type="text"
                  variant="outlined"
                  error={!!errors.email}
                  {...register('email', {
                    required: 'This field is required.',
                    setValueAs: v => v.trim()
                  })}
                />
                {errors.email &&
                  <Alert severity="error" sx={{ mt: '0.7em', '.MuiAlert-message': { overflow: 'hidden' } }}>
                    {errors.email.message}
                  </Alert>
                }
              </Box>

              <Box sx={{ marginTop: '1em' }}>
                <TextField
                  fullWidth
                  label="Enter Password..."
                  type="password"
                  variant="outlined"
                  error={!!errors.password}
                  {...register('password', {
                    required: 'This field is required.',
                    setValueAs: v => v.trim()
                  })}
                />
                {errors.password &&
                  <Alert severity="error" sx={{ mt: '0.7em', '.MuiAlert-message': { overflow: 'hidden' } }}>
                    {errors.password.message}
                  </Alert>
                }
              </Box>
            </Box>
            <CardActions sx={{ padding: '0.5em 1em 1em 1em' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Login
              </Button>
            </CardActions>
          </MuiCard>
        </Zoom>
      </form>
    </Box>
  )
}

export default Login
