/* eslint-env jest */
import {
  getProductController,
  getSingleProductController,
  productPhotoController,
  productCountController,
  productFiltersController,
  searchProductController,
  realtedProductController,
  productCategoryController,
  productListController,
  braintreeTokenController,
} from "../../controllers/productController";
import productModel from "../../models/productModel";
import categoryModel from "../../models/categoryModel";
import braintree from "braintree";

// kong

// cheng

// Mock the productModel
jest.mock("../../models/productModel.js", () => ({
  find: jest.fn(() => ({
    populate: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          sort: jest.fn(() => [
            { _id: 1, name: "Product A", createdAt: new Date() },
          ]),
        })),
      })),
    })),
  })),
  findOne: jest.fn(() => ({
    select: jest.fn(() => ({
      populate: jest.fn(() => ({
        _id: "1",
        name: "Product A",
        category: "Category A",
      })),
    })),
  })),
  findById: jest.fn(),
}));

// Mock the categoryModel
jest.mock("../../models/categoryModel.js", () => ({
  findOne: jest.fn(),
}));

describe("getProductController", () => {
  const mockRequest = () => {};
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and products when successful", async () => {
    const req = mockRequest();
    const res = mockResponse();

    await getProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      counTotal: 1,
      message: "ALlProducts ",
      products: [{ _id: 1, name: "Product A", createdAt: expect.any(Date) }],
    });
  });

  it("should return 500 when cannot find a product", async () => {
    productModel.find.mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const req = mockRequest();
    const res = mockResponse();

    await getProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr in getting products",
      error: Error("Database error"),
    });
  });
});

describe("getSingleProductController", () => {
  const mockRequest = () => {
    return {
      params: {},
    };
  };

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 when the product is found", async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params.slug = "test-slug";

    const mockProduct = { _id: "1", name: "Product A", category: "Category A" };

    await getSingleProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Single Product Fetched",
      product: mockProduct,
    });
  });

  it("should return 500 when the product is not found", async () => {
    productModel.findOne.mockImplementationOnce(() => {
      throw new Error("Cannot find product");
    });
    const req = mockRequest();
    const res = mockResponse();
    req.params.slug = "test-slug";

    await getSingleProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Eror while getitng single product",
      error: Error("Cannot find product"),
    });
  });
});

describe("getPhoto", () => {
  const mockRequest = () => {
    return {
      params: {
        pid: "1", // Mock product ID
      },
    };
  };

  const mockResponse = () => {
    const res = {};
    res.set = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  // Mock the product with photo data
  const mockProduct = {
    photo: {
      contentType: "image/jpeg",
      data: Buffer.from("image data"), // Mock image data
    },
    findById: jest.fn(),
    select: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and the photo data when the product photo exists", async () => {
    const req = mockRequest();
    const res = mockResponse();

    productModel.findById.mockReturnValueOnce({
      select: () => Promise.resolve(mockProduct),
    });

    await productPhotoController(req, res);

    expect(res.set).toHaveBeenCalledWith(
      "Content-type",
      mockProduct.photo.contentType
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockProduct.photo.data);
  });

  it("should return 500 when there is an error retrieving the product photo", async () => {
    productModel.findById.mockImplementationOnce(() => {
      throw new Error("Cannot get product photo from the database");
    });

    const req = mockRequest();
    const res = mockResponse();

    await productPhotoController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr while getting photo",
      error: Error("Cannot get product photo from the database"),
    });
  });

  it("should return 404 when there is no photo data", async () => {
    const mockProduct2 = {
      photo: {
        contentType: "image/jpeg",
        data: null, // Mock image data
      },
      findById: jest.fn(),
      select: jest.fn(),
    };
    const req = mockRequest();
    const res = mockResponse();

    productModel.findById.mockReturnValueOnce({
      select: () => Promise.resolve(mockProduct2),
    });

    await productPhotoController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr while getting photo",
      error: "Cannot get product photo from the database",
    });
  });
});

describe("productCountController", () => {
  const mockRequest = () => {
    return {};
  };

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 with the correct count if we can get the product count", async () => {
    productModel.find.mockReturnValueOnce({
      estimatedDocumentCount: () => Promise.resolve(3),
    });

    const req = mockRequest();
    const res = mockResponse();
    await productCountController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      total: 3,
    });
  });

  it("should return 500 if we are not able to get the product count", async () => {
    productModel.find.mockImplementationOnce(() => {
      throw new Error("Cannot get product count");
    });

    const req = mockRequest();
    const res = mockResponse();
    await productCountController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Error in product count",
      error: Error("Cannot get product count"),
      success: false,
    });
  });
});

describe("productFiltersController", () => {
  const mockRequest = () => {
    return {
      body: {
        checked: ["category1", "category2"],
        radio: [10, 100],
      },
    };
  };
  const mockInvalidRequest = () => {
    return {
      body: {},
    };
  };
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockProducts = [
    { name: "Product 1", price: 50, category: "category1" },
    { name: "Product 2", price: 80, category: "category2" },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("it should return 200 if we are able to filter the products", async () => {
    productModel.find.mockResolvedValue(mockProducts);
    const req = mockRequest();
    const res = mockResponse();
    await productFiltersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("it should return 400 if we have an invalid request", async () => {
    const req = mockInvalidRequest();
    const res = mockResponse();
    await productFiltersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Filtering Products",
      error: TypeError("Cannot read properties of undefined (reading 'length')")
    });
  });

  it("it should return 500 if we get an error when filtering the products", async () => {
    productModel.find.mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const req = mockRequest();
    const res = mockResponse();
    await productFiltersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Filtering Products",
      error: Error("Database error"),
    });
  });
});

describe("searchProductController", () => {
  const mockRequest = () => {
    return {
      params: {
        keyword: "product",
      },
    };
  };

  const mockProducts = [
    { name: "Product 1", price: 50, category: "category1" },
    { name: "Product 2", price: 80, category: "category2" },
  ];

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(mockProducts);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("it should return 200 with products when searching for products", async () => {
    productModel.find.mockReturnValueOnce({
      select: () => Promise.resolve(mockProducts),
    });

    const req = mockRequest();
    const res = mockResponse();
    await searchProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });

  it("it should return 500 if we get an error in searching for products", async () => {
    productModel.find.mockImplementationOnce(() => {
      throw new Error("Database error when filtering products");
    });

    const req = mockRequest();
    const res = mockResponse();
    await searchProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error when Getting products",
      error: Error("Database error when filtering products"),
    });
  });
});

describe("relatedProductController", () => {
  const mockRequest = () => {
    return {
      params: {
        cid: 1,
        pid: 1,
      },
    };
  };

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockProducts = [
    { name: "Product 1", price: 50, category: "category1" },
    { name: "Product 2", price: 80, category: "category2" },
  ];

  it("it should return 200 with products when we are able to get related products", async () => {
    productModel.find.mockReturnValueOnce({
      select: () => ({
        limit: () => ({
          populate: () => Promise.resolve(mockProducts),
        }),
      }),
    });
    const req = mockRequest();
    const res = mockResponse();

    await realtedProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("it should return 500 if there is an error when getting related products", async () => {
    productModel.find.mockImplementationOnce(() => {
      throw new Error("Database when getting related products");
    });
    const req = mockRequest();
    const res = mockResponse();

    await realtedProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error while geting related product",
      error: Error("Database when getting related products"),
    });
  });
});

describe("productCategoryController", () => {
  const mockRequest = () => {
    return {
      params: {
        slug: "CategoryA",
      },
    };
  };

  const mockResponse = () => {
    const res = {};
    res.send = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockProducts = [
    { name: "Product 1", price: 50 },
    { name: "Product 2", price: 80 },
  ];

  it("should return 200 with the correct products when we are able to get the products", async () => {
    categoryModel.findOne.mockResolvedValue("CategoryA");
    productModel.find.mockReturnValueOnce({
      populate: () => Promise.resolve(mockProducts),
    });

    const req = mockRequest();
    const res = mockResponse();
    await productCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      category: "CategoryA",
      products: mockProducts,
    });
  });

  it("should return 500 when there is an error in categoryModel", async () => {
    categoryModel.findOne.mockImplementationOnce(() => {
      throw new Error("Error when finding category");
    });

    const req = mockRequest();
    const res = mockResponse();
    await productCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: Error("Error when finding category"),
      message: "Error While Getting products",
    });
  });

  it("should return 500 when there is an error in productModel", async () => {
    categoryModel.findOne.mockResolvedValue("CategoryA");
    productModel.find.mockImplementationOnce(() => {
      throw new Error("Error when finding products");
    });

    const req = mockRequest();
    const res = mockResponse();
    await productCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: Error("Error when finding products"),
      message: "Error While Getting products",
    });
  });
});

describe("productListController", () => {
  const mockRequest1 = () => {
    return {
      params: {},
    };
  };

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockProducts = [
    { name: "Product 1", price: 50 },
    { name: "Product 2", price: 80 },
  ];

  it("it should return 200 with a list of products if there are no pages listed", async () => {
    productModel.find.mockReturnValue({
      select: () => ({
        skip: () => ({
          limit: () => ({
            sort: () => Promise.resolve(mockProducts),
          }),
        }),
      }),
    });
    const req = mockRequest1();
    const res = mockResponse();
    await productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  const mockRequest2 = () => {
    return {
      params: {
        page: 2,
      },
    };
  };

  it("it should return 200 with a list of products if there are pages listed", async () => {
    productModel.find.mockReturnValue({
      select: () => ({
        skip: () => ({
          limit: () => ({
            sort: () => Promise.resolve(mockProducts),
          }),
        }),
      }),
    });

    const req = mockRequest2();
    const res = mockResponse();
    await productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("it should return 500 if there is an error when finding products", async () => {
    productModel.find.mockImplementationOnce(() => {
      throw new Error("Error when getting products from database");
    });

    const req = mockRequest1();
    const res = mockResponse();
    await productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error in per page ctrl",
      error: Error("Error when getting products from database"),
    });
  });
});

// Mock the braintree library
jest.mock("braintree", () => {
  const clientToken = { generate: jest.fn() };
  return {
    BraintreeGateway: jest.fn(() => ({
      clientToken,
    })),
    Environment: {
      Sandbox: "Sandbox",
    },
  };
});

describe("braintreeTokenController", () => {
  it("it should successfully generate a client token", async () => {
    const req = {};
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    const mockResponse = { clientToken: "test-client-token" };

    braintree
      .BraintreeGateway()
      .clientToken.generate.mockImplementationOnce((_, callback) => {
        callback(null, mockResponse);
      });

    await braintreeTokenController(req, res);

    expect(res.send).toHaveBeenCalledWith(mockResponse);
  });

  it("it should return a status 500 if the generate function has an error", async () => {
    const req = {};
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    const mockError = Error("Cannot generate token");
    braintree
      .BraintreeGateway()
      .clientToken.generate.mockImplementationOnce((_, callback) => {
        callback(mockError, null);
      });

    await braintreeTokenController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });

  it("it should return a status 500 if we throw an error", async () => {
    const req = {};
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    braintree
      .BraintreeGateway()
      .clientToken.generate.mockImplementationOnce(() => {
        throw new Error("Error when generating client token");
      });

    await braintreeTokenController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      Error("Error when generating client token")
    );
  });
});

// // nic

// // branda
