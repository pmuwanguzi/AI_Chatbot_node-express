const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const path = require("path")
const { marked } = require("marked")

const app = express()
const PORT = process.env.PORT || 3000

require("dotenv").config()

const apiKey = process.env.API_KEY
// console.log('Your API Key:', apiKey);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Set view engine to ejs
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Routes
app.get("/", (req, res) => {
	res.render("index", { response: null })
})

app.post("/chat", async (req, res) => {
	const userInput = req.body.userInput

	if (!userInput) {
		return res.render("index", {
			response:
				"I'm here to be of service, please go ahead and type any question."
		})
	}

	try {
		const openRouterResponse = await axios.post(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				model: "deepseek/deepseek-chat-v3-0324:free",
				messages: [{ role: "user", content: userInput }]
			},
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"HTTP-Referer": "pmuwanguzi.tech",
					"X-Title": "pmuwanguzi.tech",
					"Content-Type": "application/json"
				}
			}
		)

		const markdownText =
			openRouterResponse.data.choices?.[0]?.message?.content ||
			"No response from server!"
		const htmlResponse = marked.parse(markdownText)

		res.render("index", { response: htmlResponse })
	} catch (error) {
		console.error("Error:", error)
		res.render("index", {
			response: `Error: ${error.message}`
		})
	}
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
