import NextAuth from "next-auth"

export default function authError(req, res) {
  const error = req.query.error
  const errorDescription = req.query.error_description

  console.error('Auth Error:', error, errorDescription)

  let message = 'An error occurred during sign in.'
  let statusCode = 500

  switch (error) {
    case 'OAuthSignin':
      message = 'Error starting Google sign in. Please try again.'
      break
    case 'OAuthCallback':
      message = 'Error completing Google sign in. Please try again.'
      break
    case 'OAuthCreateAccount':
      message = 'Could not create Google account. Please try again.'
      break
    case 'Callback':
      message = 'Something went wrong during sign in. Please try again.'
      break
    case 'OAuthAccountNotLinked':
      message = 'This email is already associated with another account.'
      break
    case 'SessionRequired':
      message = 'Please sign in to access this page.'
      break
    case 'Default':
      message = errorDescription || 'An unexpected error occurred.'
      break
    default:
      message = errorDescription || 'Authentication failed.'
  }

  res.status(statusCode).json({
    error: error,
    message: message,
  })
}
