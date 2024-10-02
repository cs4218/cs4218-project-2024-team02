// kong
import { registerController, loginController } from "../../controllers/authController.js";
import { findOne, save } from "../../models/userModel.js"
import { comparePassword } from "../../helpers/authHelper.js";

jest.mock("../../models/userModel", () => ({
    findOne: jest.fn().mockResolvedValue(null)
}));

// REGISTER
describe('check user registration', () => {
  let req, res;

    beforeEach(() => {
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
        findOne.mockResolvedValueOnce("test123@email.com")
        await registerController(req, res);

        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Already Register please login",
        });
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('should return error if an error is thrown', async() => {
        findOne.mockImplementationOnce(() => {
            throw new Error("Error!")
        });
        await registerController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});


// LOGIN

jest.mock("../../models/userModel", () => ({
    findOne: jest.fn().mockResolvedValue({email: "test123@email.com"})
}))

jest.mock("../../helpers/authHelper")

describe('check for empty fields in login page', () => {
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
        findOne.mockResolvedValueOnce(null);
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

});

// cheng

// nic

// branda

