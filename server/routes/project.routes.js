import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
    createProject,
    getProjects,
    getProjectById,
    assignSupervisor,
    deleteProject,
    updateProject,
} from '../controllers/project.controller.js'

const router = express.Router()

router.use(authenticate)
router.use(authorize('coordinator'))

router.post('/', createProject)                        // create project + assign supervisor
router.get('/', getProjects)                           // list all projects
router.get('/:id', getProjectById)                     // get one project
router.put('/:id/supervisor', assignSupervisor)        // reassign supervisor
router.put('/:id', updateProject)                      // update project
router.delete('/:id', deleteProject)                   // delete project

export default router