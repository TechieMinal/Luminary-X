const Skill = require('../models/Skill');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/skills/my — returns flat array, frontend: res.data.data
const getMySkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, skills, 'Skills fetched');
  } catch (error) { next(error); }
};

// GET /api/skills/user/:userId
const getUserSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.params.userId }).sort({ category: 1, name: 1 });
    return sendSuccess(res, skills, 'Skills fetched');
  } catch (error) { next(error); }
};

// POST /api/skills — returns flat skill, frontend: res.data.data
const addSkill = async (req, res, next) => {
  try {
    const { name, category, proficiency } = req.body;
    if (!name) return sendError(res, 'Skill name is required', 400);

    const existing = await Skill.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (existing) return sendError(res, 'Skill already exists', 409);

    const skill = await Skill.create({
      user: req.user._id,
      name,
      category: category || 'technical',
      proficiency: proficiency || 'beginner',
    });

    return sendSuccess(res, skill, 'Skill added', 201);
  } catch (error) { next(error); }
};

// PUT /api/skills/:id
const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return sendError(res, 'Skill not found', 404);
    if (skill.user.toString() !== req.user._id.toString()) return sendError(res, 'Not authorized', 403);

    const { proficiency, category } = req.body;
    const updates = {};
    if (proficiency) updates.proficiency = proficiency;
    if (category) updates.category = category;

    const updated = await Skill.findByIdAndUpdate(req.params.id, updates,
      { new: true, runValidators: true });

    return sendSuccess(res, updated, 'Skill updated');
  } catch (error) { next(error); }
};

// DELETE /api/skills/:id
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return sendError(res, 'Skill not found', 404);
    if (skill.user.toString() !== req.user._id.toString()) return sendError(res, 'Not authorized', 403);
    await Skill.findByIdAndDelete(req.params.id);
    return sendSuccess(res, {}, 'Skill deleted');
  } catch (error) { next(error); }
};

// POST /api/skills/:id/endorse
const endorseSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return sendError(res, 'Skill not found', 404);
    if (skill.user.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot endorse your own skill', 400);
    }

    const alreadyEndorsed = skill.endorsements.some(
      (e) => e.user.toString() === req.user._id.toString()
    );

    if (alreadyEndorsed) {
      skill.endorsements = skill.endorsements.filter(
        (e) => e.user.toString() !== req.user._id.toString()
      );
    } else {
      skill.endorsements.push({ user: req.user._id });
    }

    await skill.save();
    return sendSuccess(res,
      { endorsed: !alreadyEndorsed, count: skill.endorsements.length },
      alreadyEndorsed ? 'Endorsement removed' : 'Skill endorsed'
    );
  } catch (error) { next(error); }
};

module.exports = { getMySkills, getUserSkills, addSkill, updateSkill, deleteSkill, endorseSkill };
