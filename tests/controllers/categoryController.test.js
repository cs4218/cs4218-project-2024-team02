import { createCategoryController, updateCategoryController, deleteCategoryCOntroller, categoryControlller, singleCategoryController } from '../../controllers/categoryController';
import categoryModel from '../../models/categoryModel';
import slugify from 'slugify';

// kong

// cheng

// nic

// branda
jest.mock('../../models/categoryModel');
jest.mock('slugify');

describe('createCategoryController', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        body: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
  
    it('should return 400 if name is not provided', async () => {
      await createCategoryController(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
    });
  
    it('should return 400 if category already exists', async () => {
      req.body.name = 'Existing Category';
      categoryModel.findOne.mockResolvedValue(true); // Mocking the findOne method to simulate existing category
  
      await createCategoryController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Category Already Exisits",
      });
    });
  
    it('should create a new category successfully', async () => {
      req.body.name = 'New Category';
      categoryModel.findOne.mockResolvedValue(null); // Mocking findOne to simulate non-existing category
      slugify.mockReturnValue('new-category'); // Mocking slugify to return a slug
      categoryModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ name: 'New Category', slug: 'new-category' }),
      }));
  
      await createCategoryController(req, res);
  
      expect(categoryModel).toHaveBeenCalledWith({
        name: 'New Category',
        slug: 'new-category',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "new category created",
        category: { name: 'New Category', slug: 'new-category' },
      });
    });
  
    it('should return 500 if an error occurs', async () => {
      req.body.name = 'Error Category';
      categoryModel.findOne.mockRejectedValue(new Error('Database error')); // Simulate an error during category lookup
  
      await createCategoryController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: expect.any(Error), // Expect any error object
        message: "Errro in Category",
      });
    });
  });

  //update category
  describe('updateCategoryController', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        params: {
          id: '60e6d3a7a3d2b634843c4a49', // Example ObjectId for category
        },
        body: {
          name: 'Updated Category',
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
  
    it('should update a category successfully', async () => {
      const mockCategory = {
        name: 'Updated Category',
        slug: slugify('Updated Category'),
      };
  
      // Mock findByIdAndUpdate to return a mock category
      categoryModel.findByIdAndUpdate.mockResolvedValue(mockCategory);
  
      await updateCategoryController(req, res);
  
      expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.id,
        expect.objectContaining({
          name: 'Updated Category',
          slug: slugify('Updated Category'),
        }),
        { new: true }
      );
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        messsage: "Category Updated Successfully",
        category: mockCategory,
      });
    });
  
    it('should return 500 if there is an error during category update', async () => {
      const errorMessage = new Error('Database error');
      categoryModel.findByIdAndUpdate.mockRejectedValue(errorMessage); // Mock an error during update
  
      await updateCategoryController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: errorMessage,
        message: "Error while updating category",
      });
    });
  });

  //delete category
  describe('deleteCategoryController', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        params: {
          id: '60e6d3a7a3d2b634843c4a50', // Example ObjectId for category
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
  
    it('should delete a category successfully', async () => {
      categoryModel.findByIdAndDelete.mockResolvedValue(true); // Mock successful deletion
  
      await deleteCategoryCOntroller(req, res);
  
      //expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Categry Deleted Successfully",
      });
    });
  
    it('should return 500 if there is an error during deletion', async () => {
      const errorMessage = new Error('Database error');
      categoryModel.findByIdAndDelete.mockRejectedValue(errorMessage); // Mock an error during deletion
  
      await deleteCategoryCOntroller(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "error while deleting category",
        error: errorMessage,
      });
    });
  });

  describe("categoryController", () => {
    beforeEach(() => {
      categoryModel.find.mockReturnValue([
        {_id: 1, name: "Category A", slug: "categoryA"},
        {_id: 2, name: "Category B", slug: "categoryB"},
    ]);
    })
  
    test("should return 200 and all categories when successful", async () => {
      const req = () => {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
      };
    
      await categoryControlller(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "All Categories List",
        category: [
            {_id: 1, name: "Category A", slug: "categoryA"},
            {_id: 2, name: "Category B", slug: "categoryB"}
        ],
      });
    });

    test("should return 200 when no categories when no categories exist", async () => {
      const req = () => {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
      };
      categoryModel.find.mockReturnValue([]);
    
      await categoryControlller(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "All Categories List",
        category: [],
      });
    });

    test("should return 500 and when unsuccessful", async () => {
      const req = () => {};
      const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn().mockReturnThis()
      };

      let mockError = new Error();
      categoryModel.find.mockImplementation(() => {
          throw mockError;
      });
  
      await categoryControlller(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
          success: false,
          error: mockError,
          message: "Error while getting all categories",
      });
    });
  });

  describe("singleCategoryController", () => {
    beforeEach(() => {
      categoryModel.findOne.mockReturnValue(
        {_id: 3, name: "Category C", slug: "categoryC"},
    );
    })
  
    test("should return 200 when the category is successfully returned", async () => {
      const req = {params: {slug: "categoryC"}};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
      };
    
      await singleCategoryController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Get SIngle Category SUccessfully",
        category: {_id: 3, name: "Category C", slug: "categoryC"}
      });
    });

    test("should return 400 and when the category is not found", async () => {
      const req = {params: {slug: "categoryC"}};
      const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn().mockReturnThis()
      };
      categoryModel.findOne.mockReturnValue(null);
  
      await singleCategoryController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
          success: false,
          error: mockError,
          message: "Error While getting Single Category",
      });
    });
  
    test("should return 500 and when unsuccessful", async () => {
        const req = {params: {slug: "categoryC"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
  
        let mockError = new Error();
        categoryModel.findOne.mockImplementation(() => {
            throw mockError;
        });
    
        await singleCategoryController(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: mockError,
            message: "Error While getting Single Category",
        });
      });
  });