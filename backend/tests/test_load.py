"""
Lightweight load test script for the API.
Runs concurrent requests against the /api/analyze endpoint.

Usage: python -m backend.tests.test_load [--url URL] [--concurrency N] [--requests N]
"""
import argparse
import asyncio
import time
import httpx


async def single_request(client: httpx.AsyncClient, url: str, text: str) -> dict:
    start = time.time()
    try:
        resp = await client.post(
            f"{url}/api/analyze",
            json={"text": text},
            timeout=30.0,
        )
        return {
            "status": resp.status_code,
            "latency_ms": int((time.time() - start) * 1000),
            "success": resp.status_code == 200,
        }
    except Exception as e:
        return {
            "status": 0,
            "latency_ms": int((time.time() - start) * 1000),
            "success": False,
            "error": str(e),
        }


async def run_load_test(url: str, concurrency: int, total_requests: int):
    text = (
        "The Federal Reserve announced today that it will maintain current interest "
        "rates through the end of the quarter, citing stable employment numbers."
    )
    results = []
    semaphore = asyncio.Semaphore(concurrency)

    async def bounded_request(client):
        async with semaphore:
            return await single_request(client, url, text)

    start = time.time()
    async with httpx.AsyncClient() as client:
        tasks = [bounded_request(client) for _ in range(total_requests)]
        results = await asyncio.gather(*tasks)
    total_time = time.time() - start

    successes = sum(1 for r in results if r["success"])
    latencies = [r["latency_ms"] for r in results if r["success"]]

    print(f"\n{'='*50}")
    print(f"Load Test Results")
    print(f"{'='*50}")
    print(f"Total requests:  {total_requests}")
    print(f"Concurrency:     {concurrency}")
    print(f"Total time:      {total_time:.2f}s")
    print(f"Successes:       {successes}/{total_requests}")
    print(f"RPS:             {total_requests/total_time:.1f}")
    if latencies:
        latencies.sort()
        print(f"Avg latency:     {sum(latencies)/len(latencies):.0f}ms")
        print(f"P50 latency:     {latencies[len(latencies)//2]}ms")
        print(f"P95 latency:     {latencies[int(len(latencies)*0.95)]}ms")
        print(f"P99 latency:     {latencies[int(len(latencies)*0.99)]}ms")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:8000")
    parser.add_argument("--concurrency", type=int, default=10)
    parser.add_argument("--requests", type=int, default=50)
    args = parser.parse_args()
    asyncio.run(run_load_test(args.url, args.concurrency, args.requests))
