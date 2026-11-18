from backend.services.search import search_with_tavily


query = "who is the president of the united states?"


result = search_with_tavily(query)

print(result)