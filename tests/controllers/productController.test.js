/* eslint-env jest */
import { getProductController, createProductController, deleteProductController, updateProductController } from "../../controllers/productController";
//import productModel from '../../models/productModel';
import fs from 'fs';
import slugify from 'slugify';
import productModel from "../../models/productModel";
//import braintree from "braintree";
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
/*jest.mock("../../models/productModel.js", () => ({
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
      save: jest.fn(),
      findByIdAndDelete: jest.fn(),
      default: jest.fn(),
    }));*/

jest.mock("../../models/productModel.js", () => {
  const mockSave = jest.fn().mockResolvedValue({
    _id: 1,
    name: "Test Product",
    description: "Test Description",
    price: 100,
    category: "Test Category",
    quantity: 10,
  });

  return {
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
    save: mockSave,
    findByIdAndDelete: jest.fn(),
    default: jest.fn(),
  };
});
    

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
jest.mock('slugify');
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));
jest.mock('braintree', () => ({
  BraintreeGateway: jest.fn().mockImplementation(() => ({
    transaction: {
      sale: jest.fn().mockResolvedValue({ success: true }),
    },
    clientToken: {
      generate: jest.fn().mockResolvedValue({ clientToken: 'dummy_token' }),
    },
  })),
  Environment: {
    Sandbox: 'Sandbox', // Mock the Environment object
  },
}));


//create product
describe('createProductController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      fields: {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category: 'Test Category',
        quantity: 10,
        slug: slugify('Test Product')
      },
      files: {
        photo: {
          size: 500000,
          path: 'mock/path/to/photo',
          type: 'image/png',
          data: fs.readFileSync('mock/path/to/photo'),
          contentType: 'image/png',
        },
      },
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*
  it('should create a product successfully', async () => {
    //req.files.photo.data = fs.readFileSync(req.files.photo.path);
    //req.files.photo.contentType = req.files.photo.type;
  
    await createProductController(req, res);

    //expect(fs.readFileSync).toHaveBeenCalledWith('mock/path/to/photo');
    //expect(saveMock).toHaveBeenCalled();
    //expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Product Created Successfully',
    }));
  });*/

  it('should return 400 if name is missing', async () => {
    req.fields.name = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: 'Name is Required' });
  });

  /*
  it('should return 400 if description is missing', async () => {
    req.fields.description = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: 'Description is Required' });
  });

  it('should return 400 if photo size is larger than 1MB', async () => {
    req.files.photo.size = 1500000;

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: 'photo is Required and should be less then 1mb',
    });
  });*/

  it('should return 500 if there is an error during product creation', async () => {
    const errorMock = new Error('Mock error');


    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: 'Error in crearing product',
    });
  });
});

//delete product
describe('deleteProductController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        pid: '12345', // Example product ID
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  /*
  it('should delete a product successfully', async () => {
    productModel.findByIdAndDelete.mockResolvedValue(true); // Mock successful deletion

    await deleteProductController(req, res);

    //expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('12345');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });*/

  it('should return 500 if there is an error during deletion', async () => {
    //const errorMessage = new Error('Database error');
    //productModel.findByIdAndDelete.mockRejectedValue(errorMessage); // Mock an error during deletion

    await deleteProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while deleting product",
      error: expect.any(Error),
    });
  });
});

//update product
describe('updateProductController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        pid: '60e6d3a7a3d2b634843c4a47', // Example ObjectId for product
      },
      fields: {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
        category: '60e6d3a7a3d2b634843c4a48', // Example ObjectId for category
        quantity: 20,
        shipping: true,
      },
      files: {
        photo: {
          path: 'path/to/updated_photo.jpg',
          type: 'image/jpeg',
          size: 500000, // Example size less than 1MB
        },
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  /*
  it('should update a product successfully', async () => {
    const mockProduct = {
      save: jest.fn().mockResolvedValue(true), // Mock the save function
      photo: { data: null, contentType: null },
    };

    // Mock findByIdAndUpdate to return a mock product
    productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);

    await updateProductController(req, res);
    /*
    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.pid,
      expect.objectContaining({
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
        category: '60e6d3a7a3d2b634843c4a48',
        quantity: 20,
        slug: slugify('Updated Product'),
      }),
      { new: true }
    );

    //expect(fs.readFileSync).toHaveBeenCalledWith(req.files.photo.path);
    //expect(mockProduct.save).toHaveBeenCalled(); // Ensure save was called
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Updated Successfully",
      products: expect.any(productModel),
    });
  });*/

  it('should return 400 if name is missing', async () => {
    req.fields.name = '';

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });
/*
  it('should return 400 if description is missing', async () => {
    req.fields.description = '';

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
  });

  it('should return 400 if price is missing', async () => {
    req.fields.price = '';

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
  });

  it('should return 400 if category is missing', async () => {
    req.fields.category = '';

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
  });

  it('should return 400 if quantity is missing', async () => {
    req.fields.quantity = '';

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
  });

  it('should return 400 if photo size is larger than 1MB', async () => {
    req.files.photo.size = 2000000; // Mocking a size larger than 1MB

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: "photo is Required and should be less then 1mb" });
  });*/

  it('should return 500 if there is an error during product update', async () => {
    //const errorMessage = new Error('Database error');
    //productModel.findByIdAndUpdate.mockRejectedValue(errorMessage); // Mock an error during update

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in Updte product",
    });
  });
});