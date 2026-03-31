import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = "mongodb+srv://Pramadu:Pramadu11@cluster0.xndp4ig.mongodb.net/Labs?retryWrites=true&w=majority"
client = None
db = None
