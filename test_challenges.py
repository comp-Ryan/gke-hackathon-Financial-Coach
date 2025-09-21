#!/usr/bin/env python3
import requests
import json
import time

# Test the challenge endpoint multiple times
url = "http://localhost:8080/challenges/1011226111"
headers = {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdHVzZXIiLCJhY2N0IjoiMTAxMTIyNjExMSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3NTg0MzU0NzIsImV4cCI6MTc1ODQzOTA3Mn0.IMYzqIQPb4Sjc3grw_H-vQ_pZJBE_blDTOCq_xrbpnv64JVRz9MLi8tKYZuw78HzSgacDnSAUYGZHn9WIcHq9mmBw-YjSTnuGmUYcWv4Nvc_DVeDawY96bt4TvSVYwot8c61fNxL3tu0H2ksOAMsvOUJ7GaNV6rt2cILjtHV2OzwF-BQo3EwdmEVUmgvEwC0dVCquVAj40eHRBCZrA6WjGJNQUAsgK56Y15XsNkt6AziNdpIt-lMFhSC941ipJ_6C6QO8EfJ0oHtFHij7E3hijCaQ_RL2rOJYoG_vKNk7nl6nSksoGqFlXUG4iVXGwvoX3JCGeXqHBOs0eRgzjLTMk0md03HBd2wIJoj49i9yJ8Llw0AYZg59in53KoNEwRYquNu1bjUcH6jLPR47Yb-hzAWebDc_68l3PAMfqi5AjLvNPigu7zkmaG2c5zEjrECIiRy8DZ79mykTgTXLU2e_zNbQGtE3PKO_mKIWz9rkh3E1vXmW5RO4Hs_9jYBGGvCI_bX9qHcGDmw1gSdR9sE1OXyODtmot7rGa9sqdBnNYPD0h2O2R5v4h1uQMkonxk0zWieH5sNSQzfBUfVnl-3xcoN6-6jPOsZp1ecggcznRg60fWrSpLzLBzFz5kYZOgqstJgRHLjTnl0RDPMX_dKEN006yrT-0nRwQT32MhaUjg"
}

print("Testing challenge variety...")
print("=" * 50)

for i in range(5):
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"\nChallenge {i+1}:")
            print(f"Title: {data.get('title', 'NO TITLE')}")
            print(f"Category: {data.get('category', 'NO CATEGORY')}")
            print(f"Difficulty: {data.get('difficulty', 'NO DIFFICULTY')}")
            print(f"XP Reward: {data.get('xp_reward', 'NO XP')}")
            print(f"Challenge: {data.get('challenge', 'NO CHALLENGE')[:100]}...")
        else:
            print(f"Error {i+1}: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Exception {i+1}: {e}")
    
    time.sleep(1)  # Wait 1 second between requests

print("\n" + "=" * 50)
print("Done testing!")
