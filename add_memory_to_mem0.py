#!/usr/bin/env python3
"""Add brain visualization app update memory to mem0"""

import os
from mem0 import MemoryClient

# Initialize mem0 client with API key
api_key = "m0-neUBHhgrrUE3BRoDMwG9jaHw1MQOmNExWhw4eagl"
client = MemoryClient(api_key=api_key)

# Memory content
memory_content = """Brain visualization app major update completed. Removed severity calculations (no more 8 ACEs = 8/10). Now counts total ACEs (35+ questions including near-death experiences, being trapped, etc). Added dropdown selectors for age/duration. Shows brain regions affected by developmental period, not severity scores. 40+ brain regions mapped. Found open-source 3D brain libraries: BrainBrowser, NiiVue, Allen Brain Atlas for anatomically correct visualization. Deployed to https://brain-visualization-o962v6kjo-utlyze.vercel.app"""

# Add memory - mem0 expects messages as list format
try:
    result = client.add(
        messages=[{
            "role": "user",
            "content": memory_content
        }],
        user_id="james_brady",
        metadata={
            "project": "brain-visualization-app",
            "category": "development_update",
            "date": "2025-07-09",
            "deployment_url": "https://brain-visualization-o962v6kjo-utlyze.vercel.app"
        }
    )
    print(f"✅ Memory added successfully!")
    print(f"Memory ID: {result.get('id', result)}")
    print(f"Full result: {result}")
except Exception as e:
    print(f"❌ Error adding memory: {e}")