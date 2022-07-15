"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const app_1 = __importDefault(require("../src/app"));
chai_1.default.should();
chai_1.default.use(chai_http_1.default);
const user = {
    username: 'HanifiTest'
};
const userWithoutUsernameField = {
    user: 'HanifiTest'
};
const task = {
    username: 'HanifiTest',
    description: 'database bug fix'
};
const taskWithoutDescriptionField = {
    username: 'HanifiTest'
};
describe('tracking time API', () => {
    // get users
    describe('GET /api/users', () => {
        it('should return all users exist in db', (done) => {
            chai_1.default.request(app_1.default).get('/api/users').end((_, response) => {
                response.should.have.status(200);
                done();
            });
        });
        it('should return 404 on wrong endpoint', (done) => {
            chai_1.default.request(app_1.default).get('/user').end((_, response) => {
                response.should.have.status(404);
                done();
            });
        });
    });
    // create user
    describe('POST /api/users', () => {
        it('should create a new user', (done) => {
            chai_1.default.request(app_1.default).post('/api/users').send(user).end((_, response) => {
                response.should.have.status(201);
                response.body.should.be.a('object');
                response.body.should.have.property('username').eq(user.username);
                response.body.should.have.property('tasksRef').that.is.a('array');
                done();
            });
        });
        it('should not create a new user with already used username', (done) => {
            chai_1.default.request(app_1.default).post('/api/users').send(user).end((_, response) => {
                response.should.have.status(422);
                done();
            });
        });
        it('should not create a new user with missing username field', (done) => {
            chai_1.default.request(app_1.default).post('/api/users').send(userWithoutUsernameField).end((_, response) => {
                response.should.have.status(422);
                done();
            });
        });
    });
    // get tasks/work
    describe('GET /api/tasks', () => {
        it('should return all tasks exist in db', (done) => {
            chai_1.default.request(app_1.default).get('/api/tasks').end((_, response) => {
                response.should.have.status(200);
                done();
            });
        });
        it('should return 404 on wrong endpoint', (done) => {
            chai_1.default.request(app_1.default).get('/task').end((_, response) => {
                response.should.have.status(404);
                done();
            });
        });
    });
    // create/start work with description
    describe('POST /api/tasks/start', () => {
        it('should create a new work with description', (done) => {
            chai_1.default.request(app_1.default).post('/api/tasks/start').send(task).end((_, response) => {
                response.should.have.status(201);
                response.body.should.have.property('startDate').eq(new Date().toUTCString());
                response.body.should.be.a('object');
                response.body.should.have.property('description').eq(task.description);
                response.body.should.have.property('isStopped').eq(false);
                response.body.should.have.property('workingTime').that.is.a('number');
                done();
            });
        });
        it('should not create a new task without stopping the previous one', (done) => {
            chai_1.default.request(app_1.default).post('/api/tasks/start').send(task).end((_, response) => {
                response.should.have.status(422);
                response.body.should.be.eq('please stop any not finished work');
                done();
            });
        });
        it('should not create a new task with missing description field', (done) => {
            chai_1.default.request(app_1.default).post('/api/users').send(taskWithoutDescriptionField).end((_, response) => {
                response.should.have.status(422);
                done();
            });
        });
    });
    // stop work
    describe('POST /api/tasks/stop', () => {
        it('should stop the current work', (done) => {
            chai_1.default.request(app_1.default).post('/api/tasks/stop').send(task).end((_, response) => {
                response.should.have.status(200);
                response.body.should.be.a('object');
                response.body.should.have.property('description').eq(task.description);
                response.body.should.have.property('isStopped').eq(true);
                response.body.should.have.property('workingTime').that.is.a('number');
                response.body.should.have.property('finishDate').eq(new Date().toUTCString());
                done();
            });
        });
    });
    // export work sheet file
    describe('POST /api/tasks/export', () => {
        it('should calculate total work and export file', (done) => {
            chai_1.default.request(app_1.default).post('/api/tasks/export').send(user).end((_, response) => {
                response.should.have.status(200);
                response.body.should.be.a('array');
                done();
            });
        });
        it('should return user not found for not exist user', (done) => {
            chai_1.default.request(app_1.default).post('/api/tasks/export').send({ username: 'unknownUser' }).end((_, response) => {
                response.should.have.status(200);
                response.body.should.be.eq('user not found');
                done();
            });
        });
    });
    // delete user
    describe('DELETE /api/users/:id', () => {
        let userID;
        chai_1.default.request(app_1.default).get('/api/users').end((_, response) => {
            userID = response.body[0]._id;
        });
        if (userID) {
            it('should delete user by id', (done) => {
                chai_1.default.request(app_1.default).delete(`/api/users/${userID}`).end((_, response) => {
                    response.should.have.status(200);
                    response.body.should.be.eq('user deleted successfully');
                    done();
                });
            });
        }
    });
    // delete work
    describe('DELETE /api/tasks/:id', () => {
        let taskID;
        chai_1.default.request(app_1.default).get('/api/tasks').end((_, response) => {
            taskID = response.body[0]._id;
        });
        if (taskID) {
            it('should delete work by id', (done) => {
                chai_1.default.request(app_1.default).delete(`/api/tasks/${taskID}`).end((_, response) => {
                    response.should.have.status(200);
                    response.body.should.be.eq('work deleted successfully');
                    done();
                });
            });
        }
    });
});
