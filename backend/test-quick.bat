@echo off
echo [validation test - bad email + short password]
curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"not-email\",\"password\":\"abc\",\"fullName\":\"Test\"}"
echo.
echo [validation test - missing body]
curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{}"
echo.
echo [logout test]
curl -s -X POST http://localhost:3001/api/auth/logout
echo.
echo [me without auth]
curl -s http://localhost:3001/api/auth/me
echo.
