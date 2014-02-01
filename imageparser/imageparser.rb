# Usage: ruby imageparser.rb image_url width height /path/to/workspace

require "rubygems"
require "open-uri"
require "json"

# Extract Command Line Arguments
image_url = ARGV[0]
width = ARGV[1].to_i
height = ARGV[2].to_i
path = ARGV[3]

# Download file
open(image_url) {|f|
   File.open("#{path}/original.jpg","wb") do |file|
     file.puts f.read
   end
}

# Find grid
grid_data = [] # 2D array where black = 0, white = 1
grid_left, grid_top, grid_width, grid_height = 0
cmd = "python find_grid.py #{path}/original.jpg #{width} #{height} 0"
value = `#{cmd}`
value.lines.each_with_index do |line, i|
  s = line.chomp
  if i == 0
    grid_left = s.split[0].to_i
    grid_top = s.split[1].to_i
    grid_width = s.split[2].to_i
    grid_height = s.split[3].to_i
  else
    grid_data.push s.split.map{|s| s.to_i}
  end
end

# Clean image
cmd = "python clean_image.py #{path}/original.jpg #{path}/new.jpg #{grid_left} #{grid_top} #{grid_width} #{grid_height}"
value = `#{cmd}`

# Get columns for tesseract
Dir.mkdir("#{path}/columns")
cmd = "python find_columns.py #{path}/new.jpg #{path}/columns"
value = `#{cmd}`

# Run tesseract
clues = ""
Dir.foreach("#{path}/columns") do |item|
  next if item == '.' or item == '..'
  cmd = "tesseract #{path}/columns/#{item} #{path}/tess -l eng custom_bl"
  value = `#{cmd}`
  textfile = File.open("#{path}/tess.txt", "rb")
  clues += textfile.read
  textfile.close
end

#puts clues

# Create JSON
slots = []
BLACK = 0
WHITE = 1
position_ctr = 0

grid_data.each_with_index do |row,i|
  row.each_with_index do |element,j|
    across = false
    # is this the start of a new across?
    if (element==WHITE and (j==0 or grid_data[i][j-1]==BLACK) and (j != row.length-1 and grid_data[i][j+1]==WHITE))
      position_ctr += 1
      across = true
      slot = {}
      slot[:position] = position_ctr
      slot[:startx] = j+1
      slot[:starty] = i+1
      slot[:orientation] = "across"
      slot[:clue] = ""

      # find slot length
      crawl = j
      while crawl < row.size and grid_data[i][crawl] == WHITE do
        crawl += 1
      end

      slot[:length] = crawl-j
      slot[:answer] = " "*slot[:length]
      slots << slot
    end

    # is this the start of a new down?
    if (element==WHITE and (i==0 or grid_data[i-1][j]==BLACK) and (i != grid_data.length-1 and grid_data[i+1][j]==WHITE))
      position_ctr += 1 unless across
      slot = {}
      slot[:position] = position_ctr
      slot[:startx] = j+1
      slot[:starty] = i+1
      slot[:orientation] = "down"
      slot[:clue] = ""

      # find slot length
      crawl = i
      while crawl < grid_data.size and grid_data[crawl][j] == WHITE do
        crawl += 1
      end

      slot[:length] = crawl-i
      slot[:answer] = " "*slot[:length]
      slots << slot
    end
  end
end

slots = slots.sort do |slot1, slot2| 
  if slot1[:orientation] != slot2[:orientation]
    slot1[:orientation] <=> slot2[:orientation]
  else
    slot1[:position] <=> slot2[:position]
  end
end


# e.g. similar_to(10,1o) = true
def similar_to(target, str)
  # puts("Similar To: #{target}, #{str}, #{str.length}")
  target_str = target.to_s
  return false if target_str.length != str.length


  for i in 0..(target_str.length-1)
    target = target_str[i..i]
    actual = str[i..i]
    case target
    when "0"
      return false unless actual=="0" or actual=="o" or actual=="O"
    when "1"
      return false unless actual=="1" or actual=="i" or actual=="I"
    when "2"
      return false unless actual=="2"
    when "3"
      return false unless actual=="3" or actual=="8"
    when "4"
      return false unless actual=="4"
    when "5"
      return false unless actual=="5" or actual=="S" or actual=="s"
    when "6"
      return false unless actual=="6"
    when "7"
      return false unless actual=="7"
    when "8"
      return false unless actual=="8" or actual=="3"
    when "9"
      return false unless actual=="G" or actual=="g" or actual=="9"
    else
      return false
    end
  end
  # puts("Returning True!")
  true
end

puts clues

# Parse clues
clues_str = clues[clues.index(/(across)/i)..-1]
cur_clue_str = ""
cur_slot = nil
cur_lines = 0

i = -1
target = slots[0][:position]

clues_str.lines.each do |line|
  next if line.downcase.strip == "across" or line.downcase.strip == "down" or line.downcase.strip == ""
  actual = line.chomp[0..(target.to_s.length-1)]
  if similar_to(target, actual)
    cur_slot[:clue] = cur_clue_str.strip if cur_slot
    cur_clue_str = line[(target.to_s.length)..-1].strip+" "
    i+=1
    cur_slot = slots[i]
    target = slots[i+1][:position] if slots[i+1]
    cur_lines = 0
  else
    if cur_lines < 3
      cur_clue_str += "#{line.strip} "
      cur_lines += 1
    end
  end
end
cur_slot[:clue] = cur_clue_str.strip if cur_slot
  


# Output JSON
puts JSON.pretty_generate(slots)
out_file = File.new("#{path}/out.json", "w")
out_file.puts(JSON.pretty_generate(slots))
out_file.close