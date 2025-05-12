from fastapi import FastAPI, Depends, HTTPException
from pymongo.database import Database
from database import get_db
from pydantic import BaseModel
from typing import List
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, validator
from typing import List, Optional
import random
import colorsys
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https://.*\\.(vercel\\.app|github\\.io|githubusercontent\\.com|netlify\\.app|firebaseapp\\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Temporary in-memory storage for logged-in user
logged_in_user = {"user_id": None}
class LabelCreate(BaseModel):
    label: str
    color: Optional[str] = None
    subcategories: List[dict] = []

    @validator('label')
    def validate_label(cls, v):
        if not v or not v.strip():
            raise ValueError('Label cannot be empty')
        if len(v) > 50:
            raise ValueError('Label too long')
        return v.strip().title()
class TransactionCreate(BaseModel):
    sender_id: str  # Use str because MongoDB ObjectIds are strings
    receiver_id: str
    amount: float
    label: str

    # Add validation for amount
    @classmethod
    def validate(cls, values):
        if values.get("amount") <= 0:
            raise ValueError("Amount must be greater than zero")
        return values
class SubcategoryRequest(BaseModel):
    label: str
    name: str

    @validator('label', 'name')
    def validate_fields(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()
class UserCreate(BaseModel):
    name: str
    balance: float
    phonenumber: str
    pin: str  # Add pin field

class LoginRequest(BaseModel):
    name: str
    pin: str  # Add pin field

class SendMoneyRequest(BaseModel):
    receiver_name: str
    amount: float
    label: str
    subcategory: str  # Add subcategory field
    timestamp: str  # Add timestamp parameter

class CreateLabelRequest(BaseModel):
    label: str
    subcategories: List[str] = []  # Add subcategories field

class GeneratePlanRequest(BaseModel):
    income: float
    preferences: List[str]

class Preferences(BaseModel):  # Add the colon here
    income: float
    preferences: List[str]

class PreferencesRequest(BaseModel):
    income: float
    preferences: List[str]
@app.get("/")
def read_root():
    return {"message": "GPay Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
@app.post("/user/{user_id}/preferences")
def save_preferences(user_id: str, request: PreferencesRequest, db: Database = Depends(get_db)):
    try:
        user_object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    preferences_collection = db["preferences"]
    preferences_data = {
        "user_id": user_object_id,
        "income": request.income,
        "preferences": request.preferences,
    }

    # Upsert preferences for the user
    preferences_collection.update_one(
        {"user_id": user_object_id},
        {"$set": preferences_data},
        upsert=True,
    )

    # Convert ObjectId to string before returning the response
    preferences_data["user_id"] = str(preferences_data["user_id"])

    return {"message": "Preferences saved successfully", "preferences": preferences_data}

@app.get("/user/{user_id}/preferences")
def get_preferences(user_id: str, db: Database = Depends(get_db)):
    try:
        user_object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    preferences_collection = db["preferences"]
    preferences = preferences_collection.find_one({"user_id": user_object_id}, {"_id": 0})

    if not preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")

    # Convert ObjectId to string before returning the response
    preferences["user_id"] = str(user_object_id)

    return {"preferences": preferences}
@app.post("/login/")
def login(request: LoginRequest, db: Database = Depends(get_db)):
    users_collection = db["users"]
    user = users_collection.find_one(
        {"name": {"$regex": f"^{request.name}$", "$options": "i"}, "pin": request.pin}
    )
    print(f"Query: {{'name': {request.name}, 'pin': {request.pin}}}, Result: {user}")

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Convert ObjectId to string before returning the response
    user_id = str(user["_id"])
    
    # Set the logged_in_user global variable
    logged_in_user["user_id"] = user_id

    return {"message": "Login successful", "user_id": user_id}
@app.post("/send-money/")
def send_money(request: SendMoneyRequest, db: Database = Depends(get_db)):
    # Ensure a user is logged in
    if not logged_in_user["user_id"]:
        raise HTTPException(status_code=401, detail="User not logged in")

    sender_id = ObjectId(logged_in_user["user_id"])
    users_collection = db["users"]
    transactions_collection = db["transactions"]
    labels_collection = db["labels"]

    # Validate label
    if not labels_collection.find_one({"label": request.label}):
        raise HTTPException(status_code=400, detail="Invalid label")

    # Check if receiver exists, if not, create them
    receiver = users_collection.find_one({"name": request.receiver_name})
    if not receiver:
        new_receiver = {"name": request.receiver_name, "balance": 0.0}
        result = users_collection.insert_one(new_receiver)
        receiver_id = result.inserted_id
    else:
        receiver_id = receiver["_id"]

    sender = users_collection.find_one({"_id": sender_id})

    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    if sender["balance"] < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    # Update balances
    users_collection.update_one({"_id": sender_id}, {"$inc": {"balance": -request.amount}})
    users_collection.update_one({"_id": receiver_id}, {"$inc": {"balance": request.amount}})

    # Create transaction
    transaction = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "amount": request.amount,
        "label": request.label,
        "subcategory": request.subcategory
    }
    transactions_collection.insert_one(transaction)

    return {"message": "Transaction successful", "receiver_id": str(receiver_id)}


@app.get("/pie-chart-data/{user_id}")
def get_pie_chart_data(user_id: str, db: Database = Depends(get_db)):
    try:
        user_object_id = ObjectId(user_id)
        transactions = db["transactions"]
        labels = db["labels"]

        # Get all labels with colors first
        label_colors = {
            label["label"]: label["color"]
            for label in labels.find({}, {"label": 1, "color": 1, "_id": 0})
        }
        pipeline = [
        {"$match": {"sender_id": user_object_id}},
        {"$group": {
            "_id": {
            "label": "$label",
            "subcategory": {"$ifNull": ["$subcategory", "Other"]}  # Change default to "Other" or something else
            },
            "amount": {"$sum": "$amount"}
        }}
        ]

        results = list(transactions.aggregate(pipeline))
        total = sum(r["amount"] for r in results)

        chart_data = []
        for r in results:
            label = r["_id"]["label"]
            if label in label_colors:
                data = {
                    "label": label,
                    "subcategory": r["_id"].get("subcategory", label),
                    "amount": r["amount"],
                    "percentage": round((r["amount"] / total * 100), 2),
                    "color": label_colors[label]
                }
                chart_data.append(data)

        return {"data": chart_data}

    except Exception as e:
        print(f"Error in pie chart data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/transactions/{user_id}")
def get_transactions(user_id: str, db: Database = Depends(get_db)):
    try:
        user_object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    transactions_collection = db["transactions"]
    users_collection = db["users"]

    transactions = list(transactions_collection.find(
        {"$or": [{"sender_id": user_object_id}, {"receiver_id": user_object_id}]}
    ))

    formatted_transactions = []
    for txn in transactions:
        sender_id = txn.get("sender_id")
        receiver_id = txn.get("receiver_id")

        # Check if the current user is the sender or receiver
        is_sender = sender_id == user_object_id
        other_party_id = receiver_id if is_sender else sender_id

        # Fetch the other party's name
        other_party = users_collection.find_one({"_id": other_party_id})
        other_party_name = other_party["name"] if other_party else "Unknown User"

        formatted_txn = {
            "_id": str(txn["_id"]),
            "type": "sent" if is_sender else "received",
            "message": f"{'Sent to' if is_sender else 'Received from'} {other_party_name} ({txn.get('subcategory', 'Payment')}) on {txn.get('timestamp', datetime.now().isoformat())}",
            "amount": txn.get("amount", 0),
            "label": txn.get("label", "Other"),
            "subcategory": txn.get("subcategory", "Payment"),
            "timestamp": txn.get("timestamp", datetime.now().isoformat())
        }
        formatted_transactions.append(formatted_txn)

    return {"transactions": formatted_transactions}

@app.get("/user/{user_id}")
def get_user(user_id: str, db: Database = Depends(get_db)):
    try:
        user_object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    users_collection = db["users"]
    user = users_collection.find_one({"_id": user_object_id}, {"_id": 0, "name": 1, "balance": 1})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@app.get("/get-users/")
def get_users(db: Database = Depends(get_db)):
    users_collection = db["users"]
    users = list(users_collection.find({}, {"_id": 0, "name": 1}))  # Fetch only the 'name' field
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return {"users": users}
@app.post("/create-user/")
def create_user(user: UserCreate, db: Database = Depends(get_db)):
    users_collection = db["users"]
    if users_collection.find_one({"name": user.name}):
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = {
        "name": user.name,
        "balance": user.balance,
        "phonenumber": user.phonenumber,
        "pin": user.pin
    }
    result = users_collection.insert_one(new_user)
    return {"message": "User created successfully", "user_id": str(result.inserted_id)}
def generate_random_color(db: Database) -> str:
    labels_collection = db["labels"]
    used_colors = set(label.get("color") for label in labels_collection.find({}, {"color": 1}))
    
    def get_random_color():
        # Generate pastel colors for better visibility
        r = random.randint(180, 255)
        g = random.randint(180, 255)
        b = random.randint(180, 255)
        return f"#{r:02x}{g:02x}{b:02x}"
    
    # Try to generate unique color (max 50 attempts)
    for _ in range(50):
        color = get_random_color()
        if color not in used_colors:
            return color
            
    raise HTTPException(status_code=500, detail="Could not generate unique color")

@app.post("/create-label/")
async def create_label(label: LabelCreate, db: Database = Depends(get_db)):
    labels_collection = db["labels"]
    
    if labels_collection.find_one({"label": label.label}):
        raise HTTPException(status_code=400, detail="Label already exists")
    
    # Generate unique color
    color = generate_random_color(db)
    
    label_dict = {
        "label": label.label,
        "color": color,
        "subcategories": []
    }
    
    result = labels_collection.insert_one(label_dict)
    return {
        "message": "Label created successfully", 
        "id": str(result.inserted_id),
        "color": color
    }
# @app.post("/create-label/")
# def create_label(request: CreateLabelRequest, db: Database = Depends(get_db)):
#     labels_collection = db["labels"]
#     if labels_collection.find_one({"label": request.label}):
#         raise HTTPException(status_code=400, detail="Label already exists")
#     labels_collection.insert_one({"label": request.label})
#     return {"message": "Label created successfully"}
@app.get("/get-labels/")
def get_labels(db: Database = Depends(get_db)):
    labels_collection = db["labels"]
    labels = list(labels_collection.find({}, {"_id": 0, "label": 1, "color": 1, "subcategories": 1}))
    if not labels:
        raise HTTPException(status_code=404, detail="No labels found")
    return {"labels": labels}

def generate_shade(base_color: str, index: int) -> str:
    base_color = base_color.lstrip('#')
    rgb = tuple(int(base_color[i:i+2], 16)/255 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(*rgb)
    new_l = max(0.2, min(0.95, l - 0.1 * index))
    new_rgb = colorsys.hls_to_rgb(h, new_l, s)
    return '#{:02x}{:02x}{:02x}'.format(
        int(new_rgb[0] * 255),
        int(new_rgb[1] * 255),
        int(new_rgb[2] * 255)
    )

@app.post("/create-subcategory/")
async def create_subcategory(request: SubcategoryRequest, db: Database = Depends(get_db)):
    labels_collection = db["labels"]
    
    label_doc = labels_collection.find_one({"label": request.label})
    if not label_doc:
        raise HTTPException(status_code=404, detail="Label not found")
    
    existing_subcategories = label_doc.get("subcategories", [])
    if any(sub["name"] == request.name for sub in existing_subcategories):
        raise HTTPException(status_code=400, detail="Subcategory already exists")
    
    new_shade = generate_shade(label_doc["color"], len(existing_subcategories))
    
    new_subcategory = {
        "name": request.name,
        "color": new_shade
    }
    
    result = labels_collection.update_one(
        {"label": request.label},
        {"$push": {"subcategories": new_subcategory}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to add subcategory")
    
    return {
        "status": "success",
        "data": new_subcategory
    }