<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Một số chức năng cơ bản của EnglishLearning Bot:
### A. Giới thiệu
1. *welcome: giới thiệu bot
2. *help: hướng dẫn cách sử dụng bot
3. *profile: thông tin và tiến độ của user
### B. Luyện đề
4. *list_tests: liệt kê các đề toeic hiện có
5. *list_parts: liệt kê các part 
6. *start_test <test_id> <part_id>: chọn đề và part để làm
6. *test_continue: chọn tiếp tục khi user đang làm dang dở part đã chọn
7. *test_restart: chọn làm lại từ đầu part user đã chọn
8. *next_question: hiển thị câu hỏi tiếp theo
9. *answer <option>: trả lời câu hỏi A/B/C/D
10. *review_answers <test_id> <part_id>: xem lại các câu trả lời và giải thích
11. *progress <test_id>: xem tiến độ làm đề toeic từng part
### C. Học từ vựng
12. *list_topics_vocab: liệt kê những chủ đề từ vựng đang có
13. *vocab_random: học một từ vựng ngẫu nhiên
13. *vocab_topic <topic_name>: liệt kê 10 từ vựng theo chủ đề
14. *vocab_continue: liệt kê 10 từ tiếp theo của chủ đề đã chọn
15. *vocab add <word>: lưu từ vựng vào bộ sưu tập cá nhân
16. *vocab_my: xem danh sách từ đã lưu
17. *vocab_voice: cách đọc từ
18. *vocab remove <word<: xóa từ đã lưu
### D. Học ngữ pháp
19. *list_topics_gramma: liệt kê những chủ đề ngữ pháp đang có
20. *gramma_random: học một ngữ pháp ngẫu nhiên
21. *gramma_topic <gramma_name>: liệt kê ngữ pháp theo chủ đề
22. *gramma add <gramma>: lưu ngữ pháp vào bộ sưu tập cá nhân
23. *gramma_my: xem danh sách ngữ pháp đã lưu
24. *gramma remove <word<: xóa ngữ pháp đã lưu
### E. Q&A
25. *ask <question>: Gửi câu hỏi riêng để bot trả lời

## DataBase
-- USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  mezon_user_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TOEIC tests
CREATE TABLE toeic_tests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,         
  description TEXT,                     
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TOEIC PARTS
CREATE TABLE toeic_parts (
  id SERIAL PRIMARY KEY,
  part_number INT NOT NULL CHECK (part_number BETWEEN 1 AND 7),
  title VARCHAR(100) NOT NULL,
  description TEXT
);

-- PASSAGES (Part 6,7)
CREATE TABLE passages (
  id SERIAL PRIMARY KEY,
  part_id INT REFERENCES toeic_parts(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QUESTIONS
CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  test_id INT REFERENCES toeic_tests(id) ON DELETE CASCADE,  -- liên kết với đề
  part_id INT REFERENCES toeic_parts(id) ON DELETE CASCADE,  -- liên kết Part
  passage_id INT REFERENCES passages(id) ON DELETE SET NULL, -- đoạn văn (nếu có)
  question_number INT NOT NULL,                              -- số thứ tự trong Part
  question_text TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (test_id, part_id, question_number)                  -- đảm bảo duy nhất trong mỗi đề
);

-- QUESTION OPTIONS
CREATE TABLE question_options (
  id SERIAL PRIMARY KEY,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  option_label CHAR(1) NOT NULL CHECK (option_label IN ('A','B','C','D')),
  option_text TEXT NOT NULL
);

-- USER QUESTION HISTORY
CREATE TABLE user_question (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(id),
  chosen_option CHAR(1),
  is_correct BOOLEAN,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER PROGRESS
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  test_id INT REFERENCES toeic_tests(id),
  part_id INT REFERENCES toeic_parts(id),
  current_question_id INT REFERENCES questions(id),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, test_id, part_id)
);

CREATE TABLE user_part_results (
  id SERIAL PRIMARY KEY,
  user_id INT,
  test_id INT,
  part_id INT,
  score INT,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topics (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) DEFAULT 'general',  -- có thể dùng để phân loại nếu cần: 'vocabulary', 'grammar', hoặc 'general'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vocabulary (
  id BIGSERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  part_of_speech VARCHAR(50),
  meaning TEXT NOT NULL,
  example_sentence TEXT,
  topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grammar (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  explanation TEXT NOT NULL,
  example TEXT,
  topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER VOCABULARY
CREATE TABLE user_vocabulary (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id INT REFERENCES vocabulary(id) ON DELETE CASCADE,
  note TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, vocabulary_id)
);

-- USER GRAMMAR
CREATE TABLE user_grammar (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  grammar_id INT REFERENCES grammar(id) ON DELETE CASCADE,
  note TEXT,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, grammar_id)
);

CREATE TABLE user_questions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  status VARCHAR(20) DEFAULT 'pending',      -- pending | answered | rejected
  category VARCHAR(50),                      -- grammar, vocabulary, toeic-listening...
  similarity_score FLOAT DEFAULT 1.0,        -- để đo độ tương tự giữa câu hỏi mới và câu đã có
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answered_at TIMESTAMP
);






