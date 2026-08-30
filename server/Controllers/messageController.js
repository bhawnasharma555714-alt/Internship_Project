import  Message from "../Models/messageModel.js";
import  Project from "../Models/projectModel.js";
import  Application from "../Models/applicationModel.js";

export const getProjectMessages = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                error: "Project not Found"
            });
        }

        const isCreator =
            project.creator.toString() === req.user.id;

        let messages;

        if (isCreator) {

            messages = await Message.find({
                project: projectId
            })
                .populate("sender", "name")
                .sort({ createdAt: 1 });

        } else {

            const application = await Application.findOne({
                applicant: req.user.id,
                project: projectId,
                status: "accepted"
            });

            if (!application) {
                return res.status(403).json({
                    error: "You are not allowed to use this chat"
                });
            }

            messages = await Message.find({
                project: projectId
            })
                .populate("sender", "name")
                .sort({ createdAt: 1 });
        }

        res.status(200).json(messages);

    } catch (err) {
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                error: "Message not found"
            });
        }

        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({
                error: "You can only delete your own messages"
            });
        }

        await Message.findByIdAndDelete(messageId);

        res.status(200).json({
            message: "Message deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
};