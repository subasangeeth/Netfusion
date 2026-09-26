from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class AiConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), default="Diagnostic Session")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("AiMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AiMessage.created_at")

class AiMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    tool_calls = Column(JSON, nullable=True) # allowlisted tools called during response
    evidence = Column(JSON, nullable=True) # gathered telemetry evidence
    recommendations = Column(JSON, nullable=True) # recommended safe remediation steps
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("AiConversation", back_populates="messages")
