@echo off

echo ============================================================
echo PHASE 1 AUTH ENDPOINT TESTS
echo ============================================================

echo.
echo [1] Register - new student account
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"student@test.com\",\"password\":\"SecurePass123\",\"fullName\":\"Test Student\",\"role\":\"student\"}" ^
  -c cookies.txt
echo.

echo.
echo [2] Register - duplicate email (expect 409)
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"student@test.com\",\"password\":\"AnotherPass456\",\"fullName\":\"Dup Student\"}"
echo.

echo.
echo [3] Register - company account
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"company@test.com\",\"password\":\"CompanyPass789\",\"fullName\":\"Test Company\",\"role\":\"company\"}"
echo.

echo.
echo [4] Register - validation failure (bad email)
curl -s -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"not-an-email\",\"password\":\"short\"}"
echo.

echo.
echo [5] Login - correct credentials
curl -s -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"student@test.com\",\"password\":\"SecurePass123\"}" ^
  -c cookies.txt
echo.

echo.
echo [6] Login - wrong password (expect 401)
curl -s -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"student@test.com\",\"password\":\"WrongPassword\"}"
echo.

echo.
echo [7] GET /api/auth/me - with auth cookie
curl -s http://localhost:3001/api/auth/me ^
  -b cookies.txt
echo.

echo.
echo [8] GET /api/auth/me - without cookie (expect 401)
curl -s http://localhost:3001/api/auth/me
echo.

echo.
echo [9] Logout
curl -s -X POST http://localhost:3001/api/auth/logout ^
  -b cookies.txt ^
  -c cookies.txt
echo.

echo.
echo [10] GET /api/auth/me after logout (expect 401)
curl -s http://localhost:3001/api/auth/me ^
  -b cookies.txt
echo.

echo.
echo ============================================================
echo TESTS COMPLETE
echo ============================================================
