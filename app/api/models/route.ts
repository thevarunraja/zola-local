import {
  getAllModels,
  getModelsWithAccessFlags,
  refreshModelsCache,
} from "@/lib/models"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Since we're using local storage, return all models with proper access flags
    // Free models and Ollama models will be accessible, others will be marked as locked
    const models = await getModelsWithAccessFlags()

    return new Response(JSON.stringify({ models }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching models:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch models" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}

export async function POST() {
  try {
    refreshModelsCache()
    const models = await getAllModels()

    return NextResponse.json({
      message: "Models cache refreshed",
      models,
      timestamp: new Date().toISOString(),
      count: models.length,
    })
  } catch (error) {
    console.error("Failed to refresh models:", error)
    return NextResponse.json(
      { error: "Failed to refresh models" },
      { status: 500 }
    )
  }
}
