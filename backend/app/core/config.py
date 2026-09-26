import os
from typing import List

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        NETFUSION_MODE: str = os.getenv("NETFUSION_MODE", "demo").lower()
        PROJECT_NAME: str = "NetFusion Hybrid Cloud Network Platform"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
        BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
        SECRET_KEY: str = os.getenv("SECRET_KEY", "netfusion-super-secret-jwt-signing-key-change-in-production-2026")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
        REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
        CORS_ORIGINS: List[str] = ["*"]
        POSTGRES_USER: str = os.getenv("POSTGRES_USER", "netfusion")
        POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "netfusion_secure_password_2026")
        POSTGRES_DB: str = os.getenv("POSTGRES_DB", "netfusion_db")
        POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
        POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", 5432))
        
        @property
        def ASYNC_DATABASE_URL(self) -> str:
            return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

        @property
        def SYNC_DATABASE_URL(self) -> str:
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
        WG_INTERFACE: str = os.getenv("WG_INTERFACE", "wg0")
        WG_PORT: int = int(os.getenv("WG_PORT", 51820))
        WG_ONPREM_TUNNEL_IP: str = os.getenv("WG_ONPREM_TUNNEL_IP", "10.50.0.1/30")
        WG_AWS_TUNNEL_IP: str = os.getenv("WG_AWS_TUNNEL_IP", "10.50.0.2/30")
        ONPREM_NETWORK_CIDR: str = os.getenv("ONPREM_NETWORK_CIDR", "10.10.0.0/16")
        AWS_VPC_CIDR: str = os.getenv("AWS_VPC_CIDR", "10.20.0.0/16")
        AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
        AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
        AWS_DEFAULT_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        AWS_SESSION_TOKEN: str = os.getenv("AWS_SESSION_TOKEN", "")
        SURICATA_EVE_PATH: str = os.getenv("SURICATA_EVE_PATH", "/var/log/suricata/eve.json")
        PROMETHEUS_PORT: int = int(os.getenv("PROMETHEUS_PORT", 9090))
        
        class Config:
            case_sensitive = True
            env_file = ".env"
            extra = "allow"

except ImportError:
    # Graceful fallback for host execution without pydantic_settings package installed
    class Settings:
        NETFUSION_MODE: str = os.getenv("NETFUSION_MODE", "demo").lower()
        PROJECT_NAME: str = "NetFusion Hybrid Cloud Network Platform"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
        BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
        SECRET_KEY: str = os.getenv("SECRET_KEY", "netfusion-super-secret-jwt-signing-key-change-in-production-2026")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
        REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
        CORS_ORIGINS: List[str] = ["*"]
        POSTGRES_USER: str = os.getenv("POSTGRES_USER", "netfusion")
        POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "netfusion_secure_password_2026")
        POSTGRES_DB: str = os.getenv("POSTGRES_DB", "netfusion_db")
        POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
        POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", 5432))

        @property
        def ASYNC_DATABASE_URL(self) -> str:
            return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

        @property
        def SYNC_DATABASE_URL(self) -> str:
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

        WG_INTERFACE: str = os.getenv("WG_INTERFACE", "wg0")
        WG_PORT: int = int(os.getenv("WG_PORT", 51820))
        WG_ONPREM_TUNNEL_IP: str = os.getenv("WG_ONPREM_TUNNEL_IP", "10.50.0.1/30")
        WG_AWS_TUNNEL_IP: str = os.getenv("WG_AWS_TUNNEL_IP", "10.50.0.2/30")
        ONPREM_NETWORK_CIDR: str = os.getenv("ONPREM_NETWORK_CIDR", "10.10.0.0/16")
        AWS_VPC_CIDR: str = os.getenv("AWS_VPC_CIDR", "10.20.0.0/16")
        AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
        AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
        AWS_DEFAULT_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        AWS_SESSION_TOKEN: str = os.getenv("AWS_SESSION_TOKEN", "")
        SURICATA_EVE_PATH: str = os.getenv("SURICATA_EVE_PATH", "/var/log/suricata/eve.json")
        PROMETHEUS_PORT: int = int(os.getenv("PROMETHEUS_PORT", 9090))

settings = Settings()
