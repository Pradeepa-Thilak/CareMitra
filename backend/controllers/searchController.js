const esClient = require("../config/elasticsearch");

/* ----------------------------------------
   1) BASIC SEARCH
----------------------------------------- */
exports.searchProductsES = async (req, res) => {
  try {
    const { q, brand, category } = req.query;

    const filters = [];

    if (brand) filters.push({ term: { brand } });
    if (category) filters.push({ term: { category } });

    const response = await esClient.search({
      index: "products",
      query: {
        bool: {
          must: q
            ? [
                {
                  multi_match: {
                    query: q,
                    fields: ["name^3", "description"],
                    fuzziness: "AUTO"
                  }
                }
              ]
            : [{ match_all: {} }],
          filter: filters
        }
      }
    });

    const hits = response.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    res.status(200).json({
      success: true,
      count: hits.length,
      data: hits
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Elasticsearch basic search failed",
      error: error.message
    });
  }
};


/* ----------------------------------------
   2) ADVANCED SEARCH
----------------------------------------- */
exports.advancedSearch = async (req, res) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    let filters = [];

    if (brand) filters.push({ term: { brand } });
    if (category) filters.push({ term: { category } });
    if (minPrice || maxPrice) {
      filters.push({
        range: {
          discountedPrice: {
            gte: Number(minPrice) || 0,
            lte: Number(maxPrice) || 999999
          }
        }
      });
    }

    const from = (page - 1) * limit;

    const sortOptions = {
      "price-asc": [{ discountedPrice: "asc" }],
      "price-desc": [{ discountedPrice: "desc" }],
      "newest": [{ createdAt: "desc" }],
      "discount": [{ discount: "desc" }]
    };

    const response = await esClient.search({
      index: "products",
      from,
      size: limit,
      query: {
        bool: {
          must: q
            ? [
                {
                  multi_match: {
                    query: q,
                    fields: ["name^5", "description^2"],
                    fuzziness: "AUTO"
                  }
                }
              ]
            : [{ match_all: {} }],
          filter: filters
        }
      },
      sort: sortOptions[sort] || []
    });

    const hits = response.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      ...hit._source
    }));

    res.status(200).json({
      success: true,
      total: response.hits.total.value,
      page: Number(page),
      limit: Number(limit),
      data: hits
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Advanced search failed",
      error: error.message
    });
  }
};
