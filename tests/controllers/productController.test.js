/* eslint-env jest */
import { getProductController } from "../../controllers/productController";

// kong

// cheng
const mockRequest = () => {};
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

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
}));

describe("getProductController", () => {
  afterEach(() => {
    jest.clearAllMocks()
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
});


// nic

// branda