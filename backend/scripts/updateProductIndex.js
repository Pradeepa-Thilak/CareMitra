const es = require("../config/elasticsearch");

async function createAdvancedIndex() {
  const index = "products";

  const exists = await es.indices.exists({ index });
  if (exists) {
    console.log("Deleting old index...");
    await es.indices.delete({ index });
  }

  console.log("Creating advanced index...");

  await es.indices.create({
    index,
    body: {
      settings: {
        analysis: {
          analyzer: {
            autocomplete_analyzer: {
              tokenizer: "autocomplete_tokenizer",
              filter: ["lowercase"]
            }
          },
          tokenizer: {
            autocomplete_tokenizer: {
              type: "edge_ngram",
              min_gram: 1,
              max_gram: 20,
              token_chars: ["letter", "digit"]
            }
          }
        }
      },

      mappings: {
        properties: {
          name: {
            type: "text",
            analyzer: "autocomplete_analyzer",
            search_analyzer: "standard"
          },
          description: { type: "text" },
          brandName: { type: "keyword" },
          categoryName: { type: "keyword" },
          price: { type: "float" },
          discountedPrice: { type: "float" },
          discount: { type: "integer" },
          stock: { type: "integer" },
          isActive: { type: "boolean" },

          createdAt: { type: "date" }
        }
      }
    }
  });

  console.log("Advanced index created!");
}

createAdvancedIndex();
