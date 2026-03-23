const Project = require('../models/Project');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// GET /api/projects/my
const getMyProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const total = await Project.countDocuments({ owner: req.user._id });
    const projects = await Project.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginated(res, projects,
      { total, page, limit, pages: Math.ceil(total / limit) }, 'Projects fetched');
  } catch (error) { next(error); }
};

// GET /api/projects  (public feed)
const getPublicProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { tech, search } = req.query;

    const filter = { visibility: 'public' };
    if (tech) filter.techStack = { $in: [new RegExp(tech, 'i')] };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate('owner', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginated(res, projects,
      { total, page, limit, pages: Math.ceil(total / limit) }, 'Projects fetched');
  } catch (error) { next(error); }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name avatar bio');
    if (!project) return sendError(res, 'Project not found', 404);
    if (project.visibility === 'private' &&
        project.owner._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }
    // Return flat object — frontend does res.data.data
    return sendSuccess(res, project, 'Project fetched');
  } catch (error) { next(error); }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { title, description, techStack, githubUrl, liveUrl, status, visibility } = req.body;

    if (!title || !description) return sendError(res, 'Title and description are required', 400);

    const project = await Project.create({
      owner: req.user._id,
      title,
      description,
      techStack: techStack || [],
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      status: status || 'in-progress',
      visibility: visibility || 'public',
    });

    // Return flat object — frontend does res.data.data
    return sendSuccess(res, project, 'Project created', 201);
  } catch (error) { next(error); }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, 'Project not found', 404);
    if (project.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to update this project', 403);
    }

    const { title, description, techStack, githubUrl, liveUrl, status, visibility } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (techStack !== undefined) updates.techStack = techStack;
    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (liveUrl !== undefined) updates.liveUrl = liveUrl;
    if (status !== undefined) updates.status = status;
    if (visibility !== undefined) updates.visibility = visibility;

    const updated = await Project.findByIdAndUpdate(req.params.id, updates,
      { new: true, runValidators: true });

    // Return flat object — frontend does res.data.data
    return sendSuccess(res, updated, 'Project updated');
  } catch (error) { next(error); }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, 'Project not found', 404);
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized', 403);
    }
    await Project.findByIdAndDelete(req.params.id);
    return sendSuccess(res, {}, 'Project deleted');
  } catch (error) { next(error); }
};

// POST /api/projects/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, 'Project not found', 404);
    const liked = project.likes.includes(req.user._id);
    if (liked) project.likes = project.likes.filter((id) => id.toString() !== req.user._id.toString());
    else project.likes.push(req.user._id);
    await project.save();
    return sendSuccess(res, { liked: !liked, likesCount: project.likes.length }, liked ? 'Unliked' : 'Liked');
  } catch (error) { next(error); }
};

module.exports = { getMyProjects, getPublicProjects, getProjectById, createProject, updateProject, deleteProject, toggleLike };
