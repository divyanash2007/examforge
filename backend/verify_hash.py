from passlib.context import CryptContext
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hash = pwd_context.hash("test1234")
    print(f"Hash success: {hash}")
    assert pwd_context.verify("test1234", hash)
    print("Verification success")
except Exception as e:
    print(f"Error: {e}")
