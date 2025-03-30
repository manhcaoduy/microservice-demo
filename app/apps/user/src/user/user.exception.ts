import { status } from '@grpc/grpc-js';
import { BaseGrpcException } from '@libs/common/grpc/exceptions/grpc.exception';

export class UserNotFoundException extends BaseGrpcException {
  constructor(message: string, metadata?: any) {
    super('User not found', status.NOT_FOUND, message, {
      code: 'user_not_found',
      metadata,
    });
  }
}

export class UsernameAlreadyExistsException extends BaseGrpcException {
  constructor(message: string, metadata?: any) {
    super('Username already exists', status.ALREADY_EXISTS, message, {
      code: 'username_already_exists',
      metadata,
    });
  }
}

export class WrongPasswordException extends BaseGrpcException {
  constructor(message: string, metadata?: any) {
    super('Wrong password', status.INVALID_ARGUMENT, message, {
      code: 'wrong_password',
      metadata,
    });
  }
}
