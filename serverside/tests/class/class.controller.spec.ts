import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from '../../src/class/class.controller';
import { ClassService } from '../../src/class/class.service';
import { Class, PrismaClient } from '@prisma/client';
import { HttpException } from '@nestjs/common';
import { Create_Class_Dto } from '../../dto/createClassDto';

describe('ClassController', () => {
  let controller: ClassController;
  let service: ClassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
      providers: [
        ClassService,
        {
          provide: 'PRISMA',
          useValue: new PrismaClient(),
        },
      ],
    }).compile();

    controller = module.get<ClassController>(ClassController);
    service = module.get<ClassService>(ClassService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('tests for get class by ID request', () => {
    it('should return the class for Admin or Teacher role', async () => {
      const mockResult = {
        classID: 1,
        roomNumber: 1,
        letter: 'A',
        year: '2024',
      };
      jest
        .spyOn(service, 'getClassByID')
        .mockImplementation(() => Promise.resolve(mockResult));

      expect(await controller.getClassByID('Admin', 1)).toBe(mockResult);
      expect(await controller.getClassByID('Teacher', 1)).toBe(mockResult);
      expect(service.getClassByID).toBeCalledTimes(2);
    });
    it('should throw an exception for roles other than Admin or Teacher', async () => {
      try {
        await controller.getClassByID('Student', 1);
        fail('Should throw an exception');
      } catch (error) {
        expect(error.status).toBe(403);
        expect(error.message).toBe(
          'Student is not allowed to get a class by ID',
        );
      }
    });
  });
  describe('tests for get class by year request', () => {
    it('should return the classes for admin or teacher role', async () => {
      const mockResult: Class[] = [
        { classID: 1, roomNumber: 2, letter: 'A', year: '2024' },
        { classID: 2, roomNumber: 2, letter: 'A', year: '2024' },
      ];
      const roles = ['Admin', 'Teacher'];

      jest
        .spyOn(service, 'getClassByYear')
        .mockImplementation(() => Promise.resolve(mockResult));

      for (const role of roles) {
        expect(await controller.getClassByYear(role, '2001')).toEqual(
          mockResult,
        );
      }

      expect(service.getClassByYear).toBeCalledTimes(roles.length);
    });
    it('should throw an exception for roles not admin or teacher', async () => {
      const invalidRole = 'Student';
      try {
        await controller.getClassByYear(invalidRole, '2001');
        fail('Should throw an exception');
      } catch (error) {
        expect(error.status).toBe(403);
        expect(error.message).toBe(
          `${invalidRole} is not allowed to get a class by Year`,
        );
      }
    });
  });
  describe('tests for  create class', () => {
    it('should throw an error because role is not admin', async () => {
      try {
        await controller.createClass('Student', {} as Create_Class_Dto);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Student is not allowed to create a new class');
      }
    });
    it('calls ClassService when role is Admin', async () => {
      const createClassDto: Create_Class_Dto = {
        roomNumber: 1,
        year: '2000',
        letter: 'A',
        teachers: [],
        students: [],
      };
      const mockResult: Class = {
        classID: 1,
        roomNumber: 1,
        year: '2000',
        letter: 'A',
      };
      const createClassSpy = jest
        .spyOn(service, 'createClass')
        .mockImplementation(() => Promise.resolve(mockResult));

      expect(await controller.createClass('Admin', createClassDto)).toBe(
        mockResult,
      );

      expect(createClassSpy).toBeCalledTimes(1);
    });
  });
});
