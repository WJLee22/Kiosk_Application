from google import genai

client = genai.Client(api_key="AIzaSyA2Bs128Ame6GnA7ck7COY7vhW0rDkpEoc")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["moon jae in"])
print(response.text)