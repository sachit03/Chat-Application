
const Conversation = require("../model/conversation");
const User         = require("../model/user");
const { Op }       = require("sequelize");


exports.getOrCreate = async (req, res) => {
  const currentId = req.user.id;
  const otherId   = parseInt(req.body.userId, 10);

  if (currentId === otherId) {
    return res.status(400).json({ error: "Cannot chat with yourself" });
  }


  const [userA, userB] = currentId < otherId
    ? [currentId, otherId]
    : [otherId, currentId];

  const convoId = `${userA}_${userB}`;

  let convo = await Conversation.findByPk(convoId);
  if (!convo) {
    convo = await Conversation.create({ id: convoId, userA, userB });
  }

  return res.json({ conversationId: convo.id });
};

exports.list = async (req, res) => {
  const currentId = req.user.id;
  const convos = await Conversation.findAll({
    where: {
      [Op.or]: [{ userA: currentId }, { userB: currentId }],
    },
    include: [
      { model: User, as: "userAInfo", attributes: ["id", "name", "email"] },
      { model: User, as: "userBInfo", attributes: ["id", "name", "email"] },
    ],
  });
  res.json(convos);
};

