from postgrest import SyncPostgrestClient
from app.config import settings

def get_supabase() -> SyncPostgrestClient:
    url = f"{settings.supabase_url}/rest/v1"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}"
    }
    return SyncPostgrestClient(url, headers=headers)

supabase: SyncPostgrestClient = get_supabase()
