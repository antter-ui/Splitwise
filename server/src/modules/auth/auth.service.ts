import bcrypt from 'bcrypt';
import { User, IUser } from '../../models/User';
import { ApiError } from '../../middleware/errorHandler';
import { signToken } from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.validation';

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: IUser; token: string }> {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      currency: input.currency || 'INR',
      timezone: input.timezone || 'Asia/Kolkata',
      avatar: input.avatar || '',
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return { user, token };
  }

  static async login(input: LoginInput): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: input.email }).select('+passwordHash');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return { user, token };
  }

  static async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }
}
