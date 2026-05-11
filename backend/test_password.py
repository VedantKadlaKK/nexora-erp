from app.auth.password_handler import hash_password, verify_password

h = hash_password('test')
print(f'Hash: {h}')
print(f'Verify: {verify_password("test", h)}')
