import { BadRequestException } from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

class TestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  age!: number;
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  describe('Test-1.1.d: Validation pipe rejects invalid DTOs', () => {
    it('should pass validation with valid DTO', async () => {
      const validData = { name: 'John', age: 30 };

      const result = await pipe.transform(validData, {
        type: 'body',
        metatype: TestDto,
      });

      expect(result).toBeInstanceOf(TestDto);
      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidData = { name: '', age: 'not-a-number' };

      await expect(
        pipe.transform(invalidData, {
          type: 'body',
          metatype: TestDto,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should include detailed validation errors', async () => {
      const invalidData = { name: '', age: 'invalid' };

      try {
        await pipe.transform(invalidData, {
          type: 'body',
          metatype: TestDto,
        });
        fail('Should have thrown BadRequestException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestException);
        const response = error.getResponse() as any;
        expect(response.message).toBe('Validation failed');
        expect(response.errors).toBeInstanceOf(Array);
        expect(response.errors.length).toBeGreaterThan(0);
      }
    });

    it('should validate missing required fields', async () => {
      const invalidData = {};

      try {
        await pipe.transform(invalidData, {
          type: 'body',
          metatype: TestDto,
        });
        fail('Should have thrown BadRequestException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestException);
        const response = error.getResponse() as any;
        expect(response.errors).toHaveLength(2); // name and age
      }
    });

    it('should skip validation for primitive types', async () => {
      const primitiveValue = 'test-string';

      const result = await pipe.transform(primitiveValue, {
        type: 'param',
        metatype: String,
      });

      expect(result).toBe(primitiveValue);
    });
  });
});
