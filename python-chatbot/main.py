from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import json
import requests
from sentence_transformers import SentenceTransformer, util

app = FastAPI()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5:0.5b"
MCP_URL = "http://localhost:8080/mcp"
embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

class ChatRequest(BaseModel):
    message: str
    menu: Optional[str] = None


def call_mcp_tool(tool_name, arguments=None):
    if arguments is None:
        arguments = {}

    body ={
        "jsonrpc": "2.0",
        "id": "python-chatbot-1",
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }

    response = requests.post(MCP_URL, json=body, timeout=30)
    response.raise_for_status()
    data = response.json()

    return data["result"]["content"][0]["json"]


def parse_menu(menu_json):
    try:
        data = json.loads(menu_json) if menu_json else {}

        if isinstance(data, dict):
            return data.get("menu_items",[])

        if isinstance(data, list):
            return data

        return []
    except Exception:
        return []

def format_price(item):
    prices = item.get("prices",[])

    if not prices:
        return "Price not available"

    result = []

    for price in prices:
        amount = price.get("amount_mkd")
        option = price.get("option")

        if option:
            result.append(f"{option}: {amount} MKD")
        else:
            result.append(f"{amount} MKD")

    return ", ".join(result)

def image_for_item(item):
    return ""

def to_chat_item(item):
    return{
        "id": item.get("id"),
        "name": item.get("name"),
        "price": format_price(item),
        "image": image_for_item(item)
    }

def response_with_items(reply, items):
    return {
        "reply": reply,
        "items": [to_chat_item(item) for item in items[:6]]
    }

def get_items_mentioned_in_answer(answer, relevant_items):
    answer_lower = answer.lower()
    mentioned_items = []

    for item in relevant_items:
        item_name = item.get("name","")
        if item_name and item_name.lower() in answer_lower:
            mentioned_items.append(item)

    return mentioned_items

#tekst za ollama
def item_to_text(item):
    return (
        f"Name: {item.get('name')}\n"
        f"Category: {item.get('category')}\n"
        f"Temperature: {item.get('temperature')}\n"
        f"Sweetness: {item.get('sweetness')}\n"
        f"Caffeine: {item.get('caffeine')}\n"
        f"Allergens: {', '.join(item.get('allergens', [])) if item.get('allergens') else 'none'}\n"
        f"Flavor profile: {', '.join(item.get('flavor_profile', []))}\n"
        f"Price: {format_price(item)}\n"
        f"Description: {item.get('description')}"
    )

#tekst za embeddings
def build_menu_text(item):
    return (
        f"{item.get('name', '')}. "
        f"Category: {item.get('category', '')}. "
        f"Temperature: {item.get('temperature', '')}. "
        f"Sweetness: {item.get('sweetness', '')}. "
        f"Caffeine: {item.get('caffeine', '')}. "
        f"Allergens: {', '.join(item.get('allergens', []))}. "
        f"Flavors: {', '.join(item.get('flavor_profile', []))}. "
        f"Description: {item.get('description', '')}."
    )

def semantic_retrieve_items(message, menu_items, limit=3):
    if not menu_items:
        return []

    menu_texts = [build_menu_text(item) for item in menu_items]
    menu_embeddings = embedding_model.encode(menu_texts, convert_to_tensor=True)
    query_embedding = embedding_model.encode(message, convert_to_tensor=True)

    scores = util.cos_sim(query_embedding,menu_embeddings)[0]

    ranked_items = []

    for index, score in enumerate(scores):
        ranked_items.append((float(score), menu_items[index]))

    ranked_items.sort(key=lambda x: x[0], reverse=True)

    return [item for score, item in ranked_items[:limit]]


def ask_llm(user_message, relevant_items):
    context = "\n\n".join(item_to_text(item) for item in relevant_items)

    prompt = f"""
You are a helpful café assistant for My Grandparents House Cafe.
    
Rules:
- Only recommend items explicitly listed in the menu context.
- Never invent menu items.
- If the answer is not in the menu context, say you could not find it.
- Do not mention items outside the menu context.
- Mention allergens when relevant.
- Mention prices when useful.
- Keep the answer short, friendly and clear.
    
Menu context:
{context}

Customer question:
{user_message}
    
Answer:
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": 80,
                "num_ctx": 512,
                "num_thread": 2
            }
        },
        timeout=120
    )

    response.raise_for_status()

    data = response.json()
    return data.get("response", "Sorry, I could not generate a response.")


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        mcp_menu = call_mcp_tool("get_menu")
        menu_items = mcp_menu.get("menu_items", [])
    except Exception:
        menu_items = parse_menu(request.menu)

    if not menu_items:
        return {
            "reply": "I could not read the menu data.",
            "items": []
        }

    message = request.message.lower()

    if "coffee" in message:
        coffee_items = [
            item for item in menu_items
            if item.get("category") in ["hot_drinks", "cold_drinks"]
               and item.get("caffeine") is True
        ]

        return response_with_items(
            "here are some coffee drinks:",
            coffee_items
        )

    if "cocktail" in message or "cocktails" in message:
        cocktail_items = [
            item for item in menu_items
            if item.get("category") == "cocktails"
        ]

        return response_with_items(
            "Here are some cocktails:",
            cocktail_items
        )

    if "dessert" in message or "desserts" in message or "sweet dessert" in message:
        desert_items = [
            item for item in menu_items
            if item.get("category") == "food"
               and (
                    item.get("sweetness") in ["medium", "high"]
                    or "sweet" in " ".join(item.get("flavor_profile", [])).lower()
                    or "cake" in item.get("name", "").lower()
                    or "croissant" in item.get("name", "").lower()
               )
        ]


        return response_with_items(
            "Here are some dessert options:",
            desert_items
        )

    if (
            "without caffeine" in message
            or "no caffeine" in message
            or "caffeine-free" in message
            or "decaf" in message
    ):
        no_caffeine_items = [
            item for item in menu_items
            if item.get("caffeine") is False
        ]

        return response_with_items(
            "Here are caffeine-free options:",
            no_caffeine_items
        )

    if (
            "vegan" in message
            or "allergen friendly" in message
            or "allergen-free" in message
            or "dietary" in message
    ):
        dietary_items = [
            item for item in menu_items
            if not item.get("allergens")
        ]

        return response_with_items(
            "Here are some allergen-friendly options:",
            dietary_items
        )

    if "milk" in message or "contains milk" in message:
        milk_items = [
            item for item in menu_items
            if "milk" in " ".join(item.get("allergens", [])).lower()
        ]

        return response_with_items(
            "These items may contain milk:",
            milk_items
        )

    if "food" in message or "eat" in message or "serve" in message:
        food_items = [
            item for item in menu_items
            if item.get("category") == "food"
        ]

        return response_with_items(
            "We serve these food options:",
            food_items
        )

    if "price" in message or "cost" in message or "how much" in message:
        for item in menu_items:
            if item.get("name", "").lower() in message:
                return response_with_items(
                    f"{item.get('name')} costs {format_price(item)}.",
                    [item]
                )

        return {
            "reply": "Which item would you like the price for?",
            "items": []
        }


    relevant_items = semantic_retrieve_items(request.message, menu_items)

    try:
        answer = ask_llm(request.message, relevant_items)
        mentioned_items = get_items_mentioned_in_answer(answer, relevant_items)

        if mentioned_items:
            return response_with_items(answer.strip(), mentioned_items)

        return response_with_items(answer.strip(), relevant_items[:1])

    except Exception as e:
        return{
            "reply": (
                "The local LLM is not responding. "
                "Make sure Ollama is running and qwen2.5:0.5b is installed. "
                f"Error: {str(e)}"
            ),
            "items": []
        }

@app.get("/")
def root():
    return {"message": "Python local LLM chatbot with MCP is running"}