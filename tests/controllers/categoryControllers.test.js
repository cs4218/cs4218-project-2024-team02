import { categoryControlller, singleCategoryController } from "../../controllers/categoryController";
import categoryModel from '../../models/categoryModel';


// kong

// cheng

// nic

// Mock the category model
jest.mock("../../models/categoryModel.js", () => ({
    find: jest.fn(() => [
            {_id: 1, name: "Category A", slug: "categoryA"},
            {_id: 2, name: "Category B", slug: "categoryB"},
        ]),
    findOne: jest.fn().mockResolvedValue({_id: 3, name: "Category C", slug: "categoryC"})
    }));

describe("categoryController", () => {

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

// branda