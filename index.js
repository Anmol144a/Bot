import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, MessageFlags, ChannelType, PermissionFlagsBits } from 'discord.js';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import sqlite3 from 'sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import setupTower from './tower_module.js';

const PREFIX = '.';
const APIRONE_WALLET_ID = "";
const APIRONE_TRANSFER_KEY = "";
const BOT_TOKEN = "";
const SCAN_INTERVAL_MS = 60000;
const LOGS_CHANNEL_ID = '1419261447875330108';
const WITHDRAWAL_CHANNEL_ID = '1419261447875330108';
const FAIR_PLAY_CHANNEL_ID = '1419261447875330108';

// Level system configuration
const LEVEL_CONFIG = [
  { 
    name: 'Emberling', 
    threshold: 200, 
    roleId: '1417516523345543239', 
    reward: 2,
    emoji: '🔥',
    description: 'Beginner spark.',
    color: '#ff6f3c'
  },
  { 
    name: 'Ironclad', 
    threshold: 1000, 
    roleId: '1417516724248641568', 
    reward: 5,
    emoji: '🛡️',
    description: 'Strong starter.',
    color: '#5c5c5c'
  },
  { 
    name: 'Steelbound', 
    threshold: 2000, 
    roleId: '1417516990511190147', 
    reward: 10,
    emoji: '⚔️',
    description: 'Durable grinder.',
    color: '#8a8f9e'
  },
  { 
    name: 'Frostborne', 
    threshold: 5000, 
    roleId: '1417517158342332566', 
    reward: 20,
    emoji: '❄️',
    description: 'Cool, sharp player.',
    color: '#00cfff'
  },
  { 
    name: 'Solarflare', 
    threshold: 12500, 
    roleId: '1417518117046980808', 
    reward: 40,
    emoji: '☀️',
    description: 'Shining with energy.',
    color: '#ffd700'
  },
  { 
    name: 'Bloodfang', 
    threshold: 25000, 
    roleId: '1417517681959108748', 
    reward: 80,
    emoji: '🩸',
    description: 'Fierce challenger.',
    color: '#b3001b'
  },
  { 
    name: 'Verdant King', 
    threshold: 50000, 
    roleId: '1417518315777298674', 
    reward: 160,
    emoji: '🌿',
    description: 'Ruler of growth.',
    color: '#228b22'
  },
  { 
    name: 'Stormbringer', 
    threshold: 100000, 
    roleId: '1417530661216194781', 
    reward: 350,
    emoji: '⚡',
    description: 'Commands thunder.',
    color: '#4169e1'
  },
  { 
    name: 'Shadowbeast', 
    threshold: 250000, 
    roleId: '1417530870583005247', 
    reward: 700,
    emoji: '🌑',
    description: 'Dominates the night.',
    color: '#1a1a1a'
  },
  { 
    name: 'Eternal Flame', 
    threshold: 500000, 
    roleId: '1417531058605260860', 
    reward: 1500,
    emoji: '🔥🔥',
    description: 'Ultimate prestige.',
    color: '#ff2400'
  }
];

// Database setup
const db = new sqlite3.Database('./bot_database.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    balance REAL DEFAULT 0,
    total_wagered REAL DEFAULT 0,
    total_won REAL DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT ${Date.now()}
  )`);

  // User levels table
  db.run(`CREATE TABLE IF NOT EXISTS user_levels (
    user_id TEXT PRIMARY KEY,
    total_wagered REAL DEFAULT 0,
    current_level INTEGER DEFAULT -1,
    pending_level_claim INTEGER DEFAULT 0,
    last_level_update INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Tower games table
  db.run(`CREATE TABLE IF NOT EXISTS tower_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    bet_amount REAL NOT NULL,
    mode TEXT NOT NULL,
    tiles TEXT NOT NULL,
    revealed_rows TEXT NOT NULL,
    current_row INTEGER DEFAULT 0,
    current_multiplier REAL DEFAULT 1.0,
    status TEXT DEFAULT 'choosing',
    created_at INTEGER NOT NULL
  )`);

  console.log('✅ Database tables initialized');
});

// Helper functions for database operations
function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Level system functions
async function ensureUserExists(userId, username = null) {
  try {
    await dbRun('INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)', [userId, username]);
    await dbRun('INSERT OR IGNORE INTO user_levels (user_id, total_wagered, current_level, pending_level_claim, last_level_update) VALUES (?, 0, -1, 0, 0)', [userId]);
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel]
});

client.once('ready', () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}!`);
  console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
});

// Setup Tower game module
setupTower(client, db, createCanvas, loadImage, AttachmentBuilder);

// Basic bot commands
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    await ensureUserExists(message.author.id, message.author.username);

    switch (command) {
      case 'balance':
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [message.author.id]);
        message.reply(`💰 Your balance: ${user.balance || 0} points`);
        break;

      case 'daily':
        const dailyAmount = 100;
        await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [dailyAmount, message.author.id]);
        message.reply(`🎁 Daily reward claimed! +${dailyAmount} points`);
        break;

      case 'help':
        const helpEmbed = new EmbedBuilder()
          .setTitle('🎮 Bot Commands')
          .setColor(0x5865F2)
          .addFields(
            { name: '💰 .balance', value: 'Check your balance', inline: true },
            { name: '🎁 .daily', value: 'Claim daily reward', inline: true },
            { name: '🗼 .tower <bet>', value: 'Play Tower game', inline: true }
          )
          .setTimestamp();
        message.reply({ embeds: [helpEmbed] });
        break;
    }
  } catch (error) {
    console.error('Command error:', error);
    message.reply('❌ An error occurred while processing your command.');
  }
});

// Start the bot if token is provided
if (BOT_TOKEN) {
  client.login(BOT_TOKEN).catch(console.error);
} else {
  console.log('⚠️ BOT_TOKEN not provided. Bot will not start.');
  console.log('Please set BOT_TOKEN environment variable or update the code.');
}

export { client, db, LEVEL_CONFIG };