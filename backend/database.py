# # # # from pymongo import MongoClient
# # # # import os
# # # # from dotenv import load_dotenv
# # # # load_dotenv()

# # # # # DATABASE_URL = "mongodb://localhost:27017/"
# # # # DATABASE_URL = os.environ.get("VITE_MONGODB_URI", "mongodb://localhost:27017/")
# # # # DATABASE_NAME = "gpaydb"

# # # # client = MongoClient(DATABASE_URL)
# # # # db = client[DATABASE_NAME]

# # # # def get_db():
# # # #     """Yields a MongoDB database connection."""
# # # #     yield db

# # # from pymongo import MongoClient
# # # import os
# # # from dotenv import load_dotenv

# # # load_dotenv()

# # # DATABASE_URL = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
# # # DATABASE_NAME = "gpaydb"

# # # try:
# # #     client = MongoClient(DATABASE_URL)
# # #     client.admin.command('ping')
# # #     print("Connected to MongoDB")
# # # except Exception as e:
# # #     print(f"Error connecting to MongoDB: {e}")
# # #     exit()

# # # db = client[DATABASE_NAME]

# # # def get_db():
# # #     """Yields a MongoDB database connection."""
# # #     yield db

# # from pymongo import MongoClient
# # import os
# # from dotenv import load_dotenv

# # # Load environment variables
# # load_dotenv()

# # # Get MongoDB connection string from environment variables
# # DATABASE_URL = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
# # DATABASE_NAME = "gpaydb"

# # try:
# #     # Connect with explicit SSL settings
# #     client = MongoClient(
# #         DATABASE_URL,
# #         tls=True,
# #         tlsAllowInvalidCertificates=False,
# #         retryWrites=True,
# #         w="majority"
# #     )
    
# #     # Test the connection
# #     client.admin.command('ping')
# #     print("Connected to MongoDB")
    
# # except Exception as e:
# #     print(f"Error connecting to MongoDB: {e}")
# #     exit()

# # # Get the database
# # db = client[DATABASE_NAME]

# # def get_db():
# #     """Yields a MongoDB database connection."""
# #     yield db

# from pymongo import MongoClient
# import os
# import ssl
# from dotenv import load_dotenv

# load_dotenv()
# DATABASE_NAME = "gpaydb"

# # Try with explicit SSL context
# ssl_context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
# ssl_context.check_hostname = True
# ssl_context.verify_mode = ssl.CERT_REQUIRED

# try:
#     # Use connection string without ssl parameters
#     DATABASE_URL = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    
#     client = MongoClient(
#         DATABASE_URL,
#         ssl_cert_reqs=ssl.CERT_REQUIRED,
#         ssl_ca_certs=ssl.get_default_verify_paths().cafile,
#         connect=True,
#         serverSelectionTimeoutMS=30000
#     )
    
#     # Test connection
#     client.admin.command('ping')
#     print("Connected to MongoDB")
    
# except Exception as e:
#     print(f"Error connecting to MongoDB: {e}")
#     exit()

# db = client[DATABASE_NAME]

# def get_db():
#     """Yields a MongoDB database connection."""
#     yield db

from pymongo import MongoClient
import os
import ssl
from dotenv import load_dotenv

load_dotenv()
DATABASE_NAME = "gpaydb"

try:
    # Get connection string from environment variables
    DATABASE_URL = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    
    # Use pymongo's expected parameter naming
    client = MongoClient(
        DATABASE_URL,
        tls=True,                                  # Use TLS/SSL
        tlsCAFile=ssl.get_default_verify_paths().cafile,  # Use system CA certificates
        serverSelectionTimeoutMS=30000            # Longer timeout for debugging
    )
    
    # Test connection
    client.admin.command('ping')
    print("Connected to MongoDB")
    
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    exit()

db = client[DATABASE_NAME]

def get_db():
    """Yields a MongoDB database connection."""
    yield db