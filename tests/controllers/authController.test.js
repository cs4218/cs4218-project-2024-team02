// kong
import { registerController, loginController, forgotPasswordController, updateProfileController } from "../../controllers/authController.js";
import { getOrdersController, getAllOrdersController, orderStatusController } from "../../controllers/authController.js";

import { comparePassword, hashPassword } from "../../helpers/authHelper.js";
import { exec } from "../../models/orderModel.js"

import userModel from "../../models/userModel.js"
import orderModel from "../../models/orderModel.js";

import JWT from 'jsonwebtoken'

jest.mock("../../models/userModel", () => ({
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    save: jest.fn()
}));

jest.mock("../../helpers/authHelper.js", () => ({
    comparePassword: jest.fn(),
    hashPassword: jest.fn().mockResolvedValueOnce("hashedPassword")
}));

// REGISTER

describe('check user registration', () => {
  let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {
                name: "John Doe",
                email: "test123@example.com",
                password: "password123",
                phone: "1234567890",
                address: "123 Street",
                answer: "Football",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        userModel.findOne.mockResolvedValue(null);
    });

    test('should return error if name is missing', async () => {
        req.body.name = "";
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
    });

    test('should return error if email is missing', async () => {
        req.body.email = "";
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
    });

    test('should return error if password is missing', async () => {
        req.body.password = "";
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
    });

    test('should return error if phone number is missing', async () => {
        req.body.phone = "";
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
    });

    test('should return error if address is missing', async () => {
        req.body.address = "";
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
    });

    test('should return error if answer is missing', async () => {
        req.body.answer = "";
        await registerController(req, res);
        expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
    });

    test("should return error if user is already registered", async () => {
        userModel.findOne.mockResolvedValueOnce(req.body)
        await registerController(req, res);

        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Already Register please login",
        });
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('should return error if an error is thrown', async() => {
        userModel.findOne.mockImplementationOnce(() => {
            throw new Error("Error!")
        });
        await registerController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});


// LOGIN

describe('check user login', () => {
    let req, res;
  
    beforeEach(() => {
        req = {
            body: {
                email: "test123@example.com",
                password: "password123"
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        userModel.findOne.mockResolvedValue({
            _id: 123, 
            name: "John Doe",
            email: "test123@example.com",
            password: "password123",
            phone: "1234567890",
            address: "123 Street"
        });
    });

  
    test('should return error if email is missing', async () => {
        req.body.email = "";
        await loginController(req, res);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Invalid email or password",
        });
    });

    test('should return error if password is missing', async () => {
        req.body.password = "";
        await loginController(req, res);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Invalid email or password",
        });
    });

    test("should return error if user is not registered", async () => {
        userModel.findOne.mockResolvedValueOnce(null);
        await loginController(req, res);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Email is not registerd",
        });
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('should return error if password is wrong', async () => {
        comparePassword.mockResolvedValueOnce(false);

        await loginController(req, res);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Invalid Password",
        });
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('should log in user successfully', async () => {
        comparePassword.mockResolvedValueOnce(true);
        const mockToken = 'mockToken123'
        jest.spyOn(JWT, 'sign').mockReturnValue(mockToken); // ensure JWT token is created

        await loginController(req, res);

        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "login successfully",
            user: {
                _id: 123, 
                name: "John Doe",
                email: "test123@example.com",
                phone: "1234567890",
                address: "123 Street",
                role: undefined,
            },
            token: mockToken
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

});

// FORGET PASSWORD

describe('check user forget password', () => {
    let req, res;
  
    beforeEach(() => {
        req = {
            body: {
            email: "test123@example.com",
            answer: "Football",
            newPassword: "NEWpassword123"
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        userModel.findOne.mockResolvedValue({
            name: "John Doe",
            email: "test123@example.com",
            password: "password123",
            phone: "1234567890",
            address: "123 Street",
            answer: "Football",
        });
        userModel.findByIdAndUpdate.mockResolvedValue({
            name: "John Doe",
            email: "test123@example.com",
            password: "NEWpassword123",
            phone: "1234567890",
            address: "123 Street"
        });

    });

  
    test('should return error if email is missing', async () => {
        req.body.email = "";
        await forgotPasswordController (req, res);
        expect(res.send).toHaveBeenCalledWith({
            message: "Emai is required",
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return error if password is missing', async () => {
        req.body.newPassword = "";
        await forgotPasswordController (req, res);
        expect(res.send).toHaveBeenCalledWith({
            message: "New Password is required",
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return error if answer is missing', async () => {
        req.body.answer = "";
        await forgotPasswordController (req, res);
        expect(res.send).toHaveBeenCalledWith({
            message: "answer is required",
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return error if user is not registered", async () => {
        userModel.findOne.mockResolvedValueOnce(null);
        await forgotPasswordController(req, res);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Wrong Email Or Answer",
        });
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('should return error if an error is thrown', async() => {
        userModel.findOne.mockImplementationOnce(() => {
            throw new Error("Error!")
        });
        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    test("should reset password successfully", async () => {
        await forgotPasswordController(req, res);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Password Reset Successfully",
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });



});

// UPDATE PROFILE

describe('check user update profile', () => {
    let req, res;
  
    beforeEach(() => {
        req = {
            body: {
                name: "John Doe",
                email: "test123@example.com",
                password: "NEWpassword123",
                phone: "1234567890",
                address: "123 Street"
            },
            user: {
                _id: 123, 
                name: "John Doe",
                email: "test123@example.com",
                password: "password123",
                phone: "1234567890",
                address: "123 Street"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        userModel.findById.mockResolvedValue({
            name: "John Doe",
            email: "test123@example.com",
            password: "password123",
            phone: "1234567890",
            address: "123 Street"
        });
        userModel.findByIdAndUpdate.mockResolvedValue({
            name: "John Doe",
            email: "test123@example.com",
            password: "NEWpassword123",
            phone: "1234567890",
            address: "123 Street"
        });

    });

  
    test('should return error if new password is shorter than 6 characters', async () => {
      req.body.password = "abc";
      await updateProfileController(req, res);
      expect(res.json).toHaveBeenCalledWith({ error: "Passsword is required and 6 character long" });
    });

    test('should successfully update user profile', async () => {
        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            "message": "Profile Updated SUccessfully", 
            "success": true, 
            "updatedUser": {
                "address": "123 Street", 
                "email": "test123@example.com", 
                "name": "John Doe", 
                "password": "NEWpassword123", 
                "phone": "1234567890"
            }
        });
    });

    test('should return error if an error is thrown', async() => {
        userModel.findByIdAndUpdate.mockImplementationOnce(() => {
            throw new Error("Error!")
        });
        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ORDERS

jest.mock('../../models/orderModel', () => ({
    find: jest.fn(),
    populate: jest.fn(), 
    exec: jest.fn(),
    sort: jest.fn(),
    findByIdAndUpdate: jest.fn()
}));
  
describe('check getting orders', () => {
    let req, res;
    
    beforeEach(() => {
        req = {
            body: {
                name: "John Doe",
                email: "test123@example.com",
                password: "NEWpassword123",
                phone: "1234567890",
                address: "123 Street"
            },
            user: {
                _id: 123, 
                name: "John Doe",
                email: "test123@example.com",
                password: "password123",
                phone: "1234567890",
                address: "123 Street"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
    });

    test('should return orders of a specific user successfully', async () => {
  
      const mockOrders = [{ _id: 'order1', products: [], buyer: { name: 'John Doe' } }];
      exec.mockResolvedValueOnce(mockOrders);

      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue(mockOrders), 
        }),
      });
  
      await getOrdersController(req, res);

      expect(orderModel.find).toHaveBeenCalledWith({ buyer: 123 });
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    test('should return error if an error is thrown while getting user orders', async () => {

        orderModel.find.mockImplementationOnce(() => {
            throw new Error("error!")
        })
    
        await getOrdersController(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);

    });

    test('should return all orders successfully', async () => {
  
        const mockOrders = [{ _id: 'order1', products: [], buyer: { name: 'John Doe' } }];
        exec.mockResolvedValueOnce(mockOrders);
  
        orderModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue(mockOrders)
            })
          }),
        });
    
        await getAllOrdersController(req, res);
        expect(res.json).toHaveBeenCalledWith(mockOrders);
      });

      test('should return error if an error is thrown while getting all orders', async () => {

        orderModel.find.mockImplementationOnce(() => {
            throw new Error("error!")
        })
        await getAllOrdersController(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// UPDATE ORDERS
describe('check getting orders', () => {
    let req, res;
    
    beforeEach(() => {
        req = {
            params: {
                orderId: 123
            },
            body: {
                status: "status"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        
    });

    test("update order status successfully", async () => {
        const mockOrders = [{ _id: 'order1', products: [], buyer: { name: 'John Doe' } }];
        orderModel.findByIdAndUpdate.mockResolvedValue(mockOrders);
        await orderStatusController(req, res);
        expect(res.json).toHaveBeenCalledWith(mockOrders);
    });


});

// cheng

// nic

// branda

