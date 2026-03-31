import motor.motor_asyncio
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

client = motor.motor_asyncio.AsyncIOMotorClient(
    (os.getenv("MONGO_URI") or os.getenv("MONGO_URL")),
    tlsCAFile=certifi.where()
)

db = client[os.getenv("DB_NAME")]
lab_results_collection = db["lab_results"]
