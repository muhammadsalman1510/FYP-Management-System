import Announcements from "../models/announcements.js";

const postAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.json({
        success: false,
        message: "Fill the data",
      });
    }

    const createdAnnouncement = await Announcements.create({ title, content });
    return res.status(201).json({
      success: true,
      message: "Announcement created",
      data: createdAnnouncement,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};
export { postAnnouncement };
