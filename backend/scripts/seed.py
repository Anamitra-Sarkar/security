"""
Database seed script with sample data for testing.
Run: python -m backend.scripts.seed
"""
import asyncio
from backend.app.db.session import async_session, init_db
from backend.app.models.schemas import User, AnalysisResult
from backend.app.core.auth import hash_password


SAMPLE_TEXTS = [
    {
        "text": "URGENT: Your account has been compromised! Click here immediately to verify your identity and prevent unauthorized access to your bank account.",
        "label": "phishing",
    },
    {
        "text": "According to multiple unnamed sources, the government has been secretly adding mind-control chemicals to the water supply since 2019. Mainstream media refuses to report on this.",
        "label": "disinformation",
    },
    {
        "text": "Join our movement. The time for peaceful protest is over. We must take direct action against those who oppress us. Armed resistance is the only path to true liberation.",
        "label": "extremist_recruitment",
    },
    {
        "text": "The Federal Reserve announced today that it will maintain current interest rates through the end of the quarter, citing stable employment numbers and moderate inflation indicators.",
        "label": "benign_news",
    },
    {
        "text": "I just saw the new movie and honestly it was pretty good. The acting was solid and the plot kept me engaged throughout. Would recommend to anyone who likes thrillers. Has anyone else seen it? What did you think?",
        "label": "benign_discussion",
    },
]


async def seed():
    await init_db()
    async with async_session() as session:
        # Create demo user
        demo_user = User(
            email="demo@sentinel.dev",
            hashed_password=hash_password("demo123456"),
        )
        session.add(demo_user)

        # Create sample analysis results
        for sample in SAMPLE_TEXTS:
            result = AnalysisResult(
                user_id=demo_user.id,
                input_text=sample["text"],
                text_hash=f"seed_{sample['label']}",
                status="seed",
            )
            session.add(result)

        await session.commit()
        print(f"Seeded database with demo user and {len(SAMPLE_TEXTS)} samples")


if __name__ == "__main__":
    asyncio.run(seed())
