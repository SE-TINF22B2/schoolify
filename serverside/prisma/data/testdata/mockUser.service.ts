import { Injectable, Inject } from '@nestjs/common';
import { userRole, Admin, Teacher, Student } from '@prisma/client';
import { ClassService } from './mockClass.service';

@Injectable()
export class UserService {
  adminMock: Admin;
  teacherMocks: Teacher[] = [];
  studentMocks: Student[] = [];
  constructor(@Inject(ClassService) private classService: ClassService) {}
  async create(prisma) {
    const mockpassword = '1234';

    const studentEmails = [
      'studentmail1@test.de',
      'studentmail2@test.de',
      'studentmail3@test.de',
      'studentmail4@test.de',
    ];
    const existingRoles = await prisma.role.findMany();

    const teacherEmails = ['teachermail1@test.de', 'teachermail2@test.de'];
    const adminEmail = 'adminmail1@test.de';

    // Create the admin
    const adminLoginData = await prisma.user_Login_Data.upsert({
      where: { email: adminEmail },
      update: { password: mockpassword },
      create: {
        email: adminEmail,
        password: mockpassword,
        role: userRole.Admin,
      },
    });

    this.adminMock = await prisma.admin.upsert({
      where: { adminID: 1 },
      update: {
        name: 'Admin1',
        lastname: 'Surname1',
        user_Login_DataID: adminLoginData.user_Login_DataID,
      },
      create: {
        name: 'Admin1',
        lastname: 'Surname1',
        user_Login_DataID: adminLoginData.user_Login_DataID,
      },
    });
    // Import Classes
    await this.classService.create(prisma);
    const classA = this.classService.getClasses().classA;
    const classB = this.classService.getClasses().classB;

    // Create teachers
    for (let i = 0; i < teacherEmails.length; i++) {
      const teacherLoginData = await prisma.user_Login_Data.upsert({
        where: { email: teacherEmails[i] },
        update: { password: mockpassword },
        create: {
          email: teacherEmails[i],
          password: mockpassword,
          role: userRole.Teacher,
        },
      });

      this.teacherMocks[i] = await prisma.teacher.upsert({
        where: { teacherID: i + 1 },
        update: {
          name: `Teacher${i + 1}`,
          lastname: `Surname${i + 1}`,
          user_Login_DataID: teacherLoginData.user_Login_DataID,
        },
        create: {
          name: `Teacher${i + 1}`,
          lastname: `Surname${i + 1}`,
          user_Login_DataID: teacherLoginData.user_Login_DataID,
        },
      });
      // Check if role for classA exists
      const classARoleExists = existingRoles.find(
        (role) =>
          role.teacherID === this.teacherMocks[i].teacherID &&
          role.classID === classA.classID,
      );

      // If it doesn't exist, create
      if (!classARoleExists) {
        await prisma.role.create({
          data: {
            teacherID: this.teacherMocks[i].teacherID,
            classID: classA.classID,
          },
        });
      }

      // Repeat the same process for classB
      const classBRoleExists = existingRoles.find(
        (role) =>
          role.teacherID === this.teacherMocks[i].teacherID &&
          role.classID === classB.classID,
      );

      if (!classBRoleExists) {
        await prisma.role.create({
          data: {
            teacherID: this.teacherMocks[i].teacherID,
            classID: classB.classID,
          },
        });
      }
    }

    // Create students
    for (let i = 0; i < studentEmails.length; i++) {
      const studentLoginData = await prisma.user_Login_Data.upsert({
        where: { email: studentEmails[i] },
        update: { password: mockpassword },
        create: {
          email: studentEmails[i],
          password: mockpassword,
          role: userRole.Student,
        },
      });

      this.studentMocks[i] = await prisma.student.upsert({
        where: { studentID: i + 1 },
        update: {
          name: `Student${i + 1}`,
          lastname: `Surname${i + 1}`,
          class: {
            connect: {
              classID: i > 1 ? classB.classID : classA.classID,
            },
          },
          user_Login_Data: {
            connect: {
              user_Login_DataID: studentLoginData.user_Login_DataID,
            },
          },
        },
        create: {
          name: `Student${i + 1}`,
          lastname: `Surname${i + 1}`,
          class: {
            connect: {
              classID: i > 1 ? classB.classID : classA.classID,
            },
          },
          user_Login_Data: {
            connect: {
              user_Login_DataID: studentLoginData.user_Login_DataID,
            },
          },
        },
      });
    }
  }
  getClasses() {
    return {
      adminMock: this.adminMock,
      teacherMocks: this.teacherMocks,
      studentMocks: this.studentMocks,
    };
  }
}
