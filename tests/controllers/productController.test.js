/* eslint-env jest */
import {
  getProductController,
  getSingleProductController,
  productPhotoController,
  productCountController,
} from "../../controllers/productController";
import productModel from "../../models/productModel";

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

  it("should return 404 when cannot find a product", async () => {
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
      error: "Database error",
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

  it("should return 404 when the product is not found", async () => {
    productModel.findOne.mockImplementationOnce(() => {
      throw new Error("Cannot find product");
    });
    const req = mockRequest();
    const res = mockResponse();
    req.params.slug = "test-slug";

    await getSingleProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Eror while getitng single product",
      error: "Cannot find product",
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

  it("should return 404 when there is an error retrieving the product photo", async () => {
    productModel.findById.mockImplementationOnce(() => {
      throw new Error("Cannot get product photo from the database");
    });

    const req = mockRequest();
    const res = mockResponse();

    await productPhotoController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr while getting photo",
      error: "Cannot get product photo from the database",
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

  it("should return 404 if we are not able to get the product count", async () => {
    productModel.find.mockImplementationOnce(() => {
      throw new Error("Cannot get product count");
    });

    const req = mockRequest();
    const res = mockResponse();
    await productCountController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Error in product count",
      error: Error("Cannot get product count"),
      success: false,
    });
  });
});
// // nic

// // branda
