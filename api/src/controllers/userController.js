import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { ACCESS_TOKEN_SECRET_SIGNATURE, JwtProvider, REFRESH_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'

/**
 * Mock nhanh thông tin user thay vì phải tạo Database rồi query.
 * Nếu muốn học kỹ và chuẩn chỉnh đầy đủ hơn thì xem Playlist này nhé:
 * https://www.youtube.com/playlist?list=PLP6tw4Zpj-RIMgUPYxhLBVCpaBs94D73V
 */
const MOCK_DATABASE = {
  USER: {
    ID: 'dokyanh-sample-id-12345678',
    EMAIL: 'dokyanh.official@gmail.com',
    PASSWORD: 'dokyanh@123'
  }
}

const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }

    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client
    // Tạo thông tin payload để đính kèm trong Jwt Token: bao gồm _id và email ủa user
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }

    // Tạo 2 loại token, accessToken và refeshToken để trả về FE
    const accessToken = await JwtProvider.genarateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      5 // 5 giây hết hạn
      // '1h'
    )

    const refreshToken = await JwtProvider.genarateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '14 days'
      // 30
    )

    /**
    * Xử lý trường hợp trả về http only cookie cho phía trình duyệt
    * Về cái maxAge và thư viện ms: https://expressjs.com/en/api.html
    * Đối với cái maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày, tùy dự án. Lưu ý
    * thời gian sống của cookie khác với cái thời gian sống của token nhé. Đừng bị nhầm lẫn :D
    */
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    const response = {
      ...userInfo,
      accessToken,
      refreshToken
    }
    res.status(StatusCodes.OK).json(response)
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    // Xóa cookie
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    // Cách 1: Lẩy refreshToken từ Cookie đã đính kèm vào request
    const refreshTokenFromCookie = req.cookies?.refreshToken
    // Cách 2: Từ localstorage phía FE sẽ truyền vào body khi gọi API
    const refreshTokenFromBody = req.body?.refreshToken

    // Verify / giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      refreshTokenFromCookie,
      // refreshTokenFromBody,
      REFRESH_TOKEN_SECRET_SIGNATURE
    )
    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cổ định của user trong token rồi, vì vậy có thể
    // lẩy luôn từ decoded ra, tiết kiệm query vào DB đề lẩy data mới.
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email
    }
    // Tạo accessToken mới
    const accessToken = await JwtProvider.genarateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      5 // 5 giây hết hạn
      // '1h'
    )

    // Res lại cookie accessToken mới cho trường hợp sử dụng cookiea
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    // Trả về accessToken mới cho trường hợp FE cần update lại trong Localstorage
    res.status(StatusCodes.OK).json({ accessToken })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Refresh Token API failed'})
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
