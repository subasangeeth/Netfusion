from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.ai import AiConversation, AiMessage
from app.schemas.all_schemas import AiChatRequest, AiChatResponse
from app.services.ai_service import AiDiagnosticEngine
from app.api.deps import get_current_user, record_audit_log

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/chat", response_model=AiChatResponse)
async def chat_with_diagnostic_ai(
    payload: AiChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Find or create conversation
    conv_id = payload.conversation_id
    if not conv_id:
        new_conv = AiConversation(title=payload.message[:50], user_id=current_user.id)
        db.add(new_conv)
        await db.commit()
        await db.refresh(new_conv)
        conv_id = new_conv.id

    # Record User Message
    user_msg = AiMessage(
        conversation_id=conv_id,
        role="user",
        content=payload.message
    )
    db.add(user_msg)

    # Execute AI Diagnostic Engine (Using Allowlisted Tools)
    diagnosis = AiDiagnosticEngine.diagnose_query(payload.message)

    # Record AI Response Message
    ai_msg = AiMessage(
        conversation_id=conv_id,
        role="assistant",
        content=diagnosis["reply"],
        tool_calls=diagnosis["executed_tools"],
        evidence=diagnosis["observed_evidence"],
        recommendations=diagnosis["recommended_remediation"]
    )
    db.add(ai_msg)
    await db.commit()

    # Rule 22: Every AI tool call must be logged in audit logs
    user_role = current_user.roles[0].name if current_user.roles else "ADMIN"
    for tool_name in diagnosis["executed_tools"]:
        await record_audit_log(
            db, current_user.email, user_role, "AI_TOOL_CALL", "AI", tool_name, "SUCCESS",
            {"query": payload.message, "tool": tool_name}, request.client.host if request.client else None
        )

    return {
        "conversation_id": conv_id,
        "reply": diagnosis["reply"],
        "observed_evidence": diagnosis["observed_evidence"],
        "possible_causes": diagnosis["possible_causes"],
        "recommended_checks": diagnosis["recommended_checks"],
        "recommended_remediation": diagnosis["recommended_remediation"],
        "executed_tools": diagnosis["executed_tools"],
        "requires_confirmation": diagnosis["requires_confirmation"],
        "pending_action": None
    }
