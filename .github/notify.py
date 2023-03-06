# -*- coding: utf-8 -*-
import asyncio
import os
import botpy

appid = os.getenv('APPID')
token = os.getenv('TOKEN')
channelid = os.getenv('CHANNELID')
message = os.getenv('MESSAGE')


async def run():
    http = botpy.BotHttp(5, app_id=appid, token=token)
    api = botpy.BotAPI(http)

    await api.post_message(channel_id=channelid, content=message)


asyncio.run(run())