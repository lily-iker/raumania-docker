import os
import json
import re
from flask import Flask, request, jsonify

# LangChain core and components
from langchain_ollama import OllamaLLM
from langchain.text_splitter import RecursiveCharacterTextSplitter 
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

# Document loaders
from langchain_community.document_loaders import (
    PyMuPDFLoader,
    UnstructuredWordDocumentLoader,
    UnstructuredExcelLoader,
)

from langchain.prompts import PromptTemplate

app = Flask(__name__)

# LLM for answering questions
llm = OllamaLLM(
    model="gemma3:1b",
    base_url="http://ollama:11434"
)
# Embedding model using Hugging Face
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# --- Helper Functions ---

def load_document(file_path):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        loader = PyMuPDFLoader(file_path)
    elif ext in [".docx", ".doc"]:
        loader = UnstructuredWordDocumentLoader(file_path)
    elif ext in [".xlsx", ".xls"]:
        loader = UnstructuredExcelLoader(file_path)
    elif ext == ".json":
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

            # Extract individual items from "content"
            content_list = data.get("content", [])
            total_elements = data.get("totalElements", len(content_list))

            documents = []
            for item in content_list:
                if "variantNames" in item:
                    text = f"Product Name: {item['name']}, Price: ${item['price']}, Brand: {item['brandName']}, Variants: {', '.join(item['variantNames'])}"
                elif "productNames" in item:
                    text = f"Brand Name: {item['name']}, Products: {', '.join(item['productNames'])}"
                elif list(item.keys()) == ["id", "name", "price"]:
                    text = f"Product Name: {item['name']}, Price: ${item['price']}, ID: {item['id']}"
                elif list(item.keys()) == ["id", "name"]:
                    text = f"Brand Name: {item['name']}, ID: {item['id']}"
                else:
                    text = json.dumps(item)
                documents.append(Document(page_content=text))

            return documents, total_elements
    else:
        raise ValueError("Unsupported file type")

    return loader.load()

def prepare_retriever(docs):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    split_docs = splitter.split_documents(docs)
    vectorstore = FAISS.from_documents(split_docs, embeddings)
    return vectorstore.as_retriever()

# --- Load Product Data Directly ---
def load_product_data():
    product_path = os.path.join('/app/uploads', 'product.json')
    with open(product_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return {item['name']: item for item in data.get('content', [])}

# --- Load Brand Data Directly ---
def load_brand_data():
    brand_path = os.path.join('/app/uploads', 'brand.json')
    with open(brand_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return {item['name']: item for item in data.get('content', [])}

# --- Custom Prompt for Raumania Assistant ---

template = """
You are Raumania's helpful and friendly virtual assistant. 
Raumania is an elegant fragrance and perfume store that sells premium scents.

Here's what you know:
- We currently offer {total_products} products.
- We currently carry {total_brands} unique fragrance brands.

Use the following context to answer customer questions about our products and brands.

Always:
- Use the $ symbol when mentioning prices.
- Be precise and accurate with numbers.
- Do not ask follow-up questions.
- If you're unsure, politely say you don't have that information.

Context:
{context}

Question:
{question}

Helpful Answer:
"""

custom_prompt = PromptTemplate(
    input_variables=["context", "question", "total_products", "total_brands"],
    template=template,
)

# --- Price Extraction Function ---
def is_price_query(query):
    price_patterns = [
        r"how much (is|does) .* cost",
        r"what (is|does) the price of .*",
        r"price of .*",
        r"how much for .*",
        r"cost of .*"
    ]
    
    for pattern in price_patterns:
        if re.search(pattern, query.lower()):
            return True
    return False

def extract_product_name(query):
    price_patterns = [
        r"how much (is|does) (the )?(.+?)( cost| price)?(\?)?$",
        r"what (is|does) the price of (.+?)(\?)?$",
        r"price of (.+?)(\?)?$",
        r"how much for (.+?)(\?)?$",
        r"cost of (.+?)(\?)?$"
    ]
    
    for pattern in price_patterns:
        match = re.search(pattern, query.lower())
        if match:
            # The product name will be in group 2 or 3 depending on the pattern
            for group_idx in [2, 3]:
                if group_idx < len(match.groups()) and match.group(group_idx):
                    return match.group(group_idx).strip()
    return None

# --- Variant Query Functions ---
def is_variant_query(query):
    variant_patterns = [
        r"how many variants? (does|has|have) .+",
        r"what (are|is) the variants? of .+",
        r"what variants? (are|is) available for .+",
        r"show me (all|the) variants? of .+",
        r"list (all|the) variants? of .+",
        r"variants? of .+",
        r"what (are|is) the name of variants? of .+"
    ]
    
    for pattern in variant_patterns:
        if re.search(pattern, query.lower()):
            return True
    return False

def extract_product_name_from_variant_query(query):
    variant_patterns = [
        r"how many variants? (does|has|have) (.+?)(\?)?$",
        r"what (are|is) the variants? of (.+?)(\?)?$",
        r"what variants? (are|is) available for (.+?)(\?)?$",
        r"show me (all|the) variants? of (.+?)(\?)?$",
        r"list (all|the) variants? of (.+?)(\?)?$",
        r"variants? of (.+?)(\?)?$",
        r"what (are|is) the name of variants? of (.+?)(\?)?$"
    ]
    
    for pattern in variant_patterns:
        match = re.search(pattern, query.lower())
        if match:
            # The product name will typically be in group 2
            if len(match.groups()) >= 2 and match.group(2):
                return match.group(2).strip()
    return None

# --- Brand Query Functions ---
def is_brand_query(query):
    brand_patterns = [
        r"how many products? (does|has|have) .+ (have|has|carry|offer)",
        r"how many products? (does|has|have) .+ (brand|company)",
        r"what products? (are|is) from .+",
        r"show me (all|the) products? (by|from) .+",
        r"list (all|the) products? (from|by) .+",
        r"what (does|do) .+ offer",
        r"products? (from|by) .+",
        r"how many products? does .+ has"
    ]
    
    for pattern in brand_patterns:
        if re.search(pattern, query.lower()):
            return True
    return False

def extract_brand_name_from_brand_query(query):
    brand_patterns = [
        r"how many products? (does|has|have) (.+?) (have|has|carry|offer)",
        r"how many products? (does|has|have) (.+?) (brand|company)",
        r"what products? (are|is) from (.+?)(\?)?$",
        r"show me (all|the) products? (by|from) (.+?)(\?)?$",
        r"list (all|the) products? (from|by) (.+?)(\?)?$",
        r"what (does|do) (.+?) offer",
        r"products? (from|by) (.+?)(\?)?$",
        r"how many products? does (.+?) has"
    ]
    
    for pattern in brand_patterns:
        match = re.search(pattern, query.lower())
        if match:
            # The brand name will typically be in group 2
            if len(match.groups()) >= 2 and match.group(2):
                return match.group(2).strip()
    return None

def find_exact_product(product_name, product_data):
    # Try exact match first
    for name, data in product_data.items():
        if name.lower() == product_name.lower():
            return data
    
    # Try partial match
    best_match = None
    highest_score = 0
    
    for name, data in product_data.items():
        # Simple word overlap scoring
        query_words = set(product_name.lower().split())
        name_words = set(name.lower().split())
        common_words = query_words.intersection(name_words)
        
        if common_words:
            score = len(common_words) / max(len(query_words), len(name_words))
            if score > highest_score:
                highest_score = score
                best_match = data
    
    # Only return if we have a reasonable match
    if highest_score > 0.5:
        return best_match
    
    return None

# --- Flask Endpoint ---

@app.route('/ask', methods=['POST'])
def ask():
    if 'prompt' not in request.form:
        return jsonify({'error': 'Prompt is required'}), 400

    prompt = request.form['prompt']
    base_path = '/app/uploads'
    product_path = os.path.join(base_path, 'product.json')
    brand_path = os.path.join(base_path, 'brand.json')

    # Check if both files exist
    if not os.path.exists(product_path) or not os.path.exists(brand_path):
        return jsonify({'error': 'One or both JSON files are missing.'}), 404

    try:
        # Load data first - fix for the reference before assignment issue
        product_data = load_product_data()
        brand_data = load_brand_data()

        # Handle variant queries
        if is_variant_query(prompt):
            product_name = extract_product_name_from_variant_query(prompt)
            if product_name:
                product = find_exact_product(product_name, product_data)
                if product:
                    if "how many" in prompt.lower():
                        num_variants = len(product['variantNames'])
                        return jsonify({'response': f"{product['name']} has {num_variants} variants."})
                    else:
                        variants = product['variantNames']
                        return jsonify({'response': f"The variants of {product['name']} are: {', '.join(variants)}"})
                else:
                    return jsonify({'response': f"I couldn't find a product named '{product_name}'. Please check the spelling and try again."})

        # Handle brand queries
        elif is_brand_query(prompt):
            brand_name = extract_brand_name_from_brand_query(prompt)
            if brand_name:
                # Try to find the brand
                brand = None
                for name, data in brand_data.items():
                    if name.lower() == brand_name.lower() or brand_name.lower() in name.lower():
                        brand = data
                        break
                
                if brand:
                    if "how many" in prompt.lower():
                        num_products = len(brand['productNames'])
                        return jsonify({'response': f"{brand['name']} has {num_products} products."})
                    else:
                        products = brand['productNames']
                        # If there are too many products, limit the response
                        if len(products) > 10:
                            product_list = ", ".join(products[:10]) + f", and {len(products) - 10} more."
                            return jsonify({'response': f"Some products from {brand['name']} include: {product_list}"})
                        else:
                            return jsonify({'response': f"Products from {brand['name']}: {', '.join(products)}"})
                else:
                    return jsonify({'response': f"I couldn't find a brand named '{brand_name}'. Please check the spelling and try again."})

        # Special handling for price queries
        elif is_price_query(prompt):
            product_name = extract_product_name(prompt)
            if product_name:
                product = find_exact_product(product_name, product_data)
                
                if product:
                    response = f"The price of {product['name']} is ${product['price']}."
                    return jsonify({'response': response})
        
        # Standard QA for other queries
        # Load both documents
        docs_product, total_products = load_document(product_path)
        docs_brand, total_brands = load_document(brand_path)

        # Merge them
        all_docs = docs_product + docs_brand

        # Prepare retriever
        retriever = prepare_retriever(all_docs)

        # Create QA chain with custom prompt
        qa = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=retriever,
            chain_type="stuff",
            chain_type_kwargs={
                "prompt": custom_prompt.partial(
                    total_products=total_products,
                    total_brands=total_brands
                )
            }
        )

        answer = qa.invoke(prompt)

        print(answer)
        
        return jsonify({'response': answer['result']})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
